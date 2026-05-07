const AUTOFIX_ENV_VAR = 'OPENCODE_VERIFY_AUTOFIX';
const FAILURE_ID_PREFIX = 'VERIFY_FAILURE_ID=';
const IDLE_EVENT_DEDUPE_MS = 1000;
const MAX_ERROR_SUMMARY_CHARS = 500;
const MAX_TRACKED_SESSIONS = 100;
const PLUGIN_METADATA_SOURCE = 'verify-on-idle';
const PLUGIN_METADATA_REASON = 'verification-failed';
const VERIFY_FAILURE_FALLBACK = 'Verification failed. Run tools/verify/verify.sh for details.';

type TextPart = {
  ignored?: boolean;
  metadata?: unknown;
  synthetic?: boolean;
  text: string;
  type: 'text';
};

type Part = {
  ignored?: boolean;
  metadata?: unknown;
  text?: string;
  type: string;
};

type MessageInfo = {
  id: string;
  role: string;
  sessionID: string;
  time: {
    completed?: number;
    created: number;
  };
};

type SessionMessage = {
  info: MessageInfo;
  parts: Part[];
};

type OpenCodeClient = {
  app: {
    log: (input: {
      body: {
        extra?: Record<string, unknown>;
        level: 'debug' | 'error' | 'info' | 'warn';
        message: string;
        service: string;
      };
    }) => Promise<unknown>;
  };
  session: {
    messages: (input: { path: { id: string } }) => Promise<{ data: SessionMessage[] }>;
    prompt: (input: {
      body: {
        noReply?: boolean;
        parts: TextPart[];
      };
      path: { id: string };
    }) => Promise<unknown>;
  };
  tui: {
    showToast: (input: { body: { message: string; variant: 'error' } }) => Promise<unknown>;
  };
};

type ShellCommand = {
  quiet: () => Promise<unknown>;
};

type Shell = (strings: TemplateStringsArray, ...values: string[]) => ShellCommand;

type OpenCodeEvent = {
  properties?: Record<string, unknown>;
  type: string;
};

type CompletedAssistantMessage = {
  completedAt: number;
  messageID: string;
  sessionID: string;
};

type VerifyFailure = {
  failureID?: string;
  message: string;
};

type VerifyOnIdleContext = {
  $: Shell;
  client: OpenCodeClient;
  directory: string;
};

const autofixAttemptedFailuresBySession = new Map<string, Set<string>>();
const inFlightSessions = new Set<string>();
const lastCompletedAssistantMessageBySession = new Map<string, CompletedAssistantMessage>();
const lastHandledAssistantMessageBySession = new Map<string, string>();
const lastIdleHandledMessageBySession = new Map<string, string>();
const lastIdleSignalBySession = new Map<string, number>();
const trackedSessionKeys: string[] = [];

const truncate = (value: string, maxChars: number): string => {
  return value.length > maxChars ? `${value.slice(0, maxChars)}\n... (truncated)` : value;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isAutofixEnabled = (): boolean => {
  const value = process.env[AUTOFIX_ENV_VAR];

  if (value === undefined) {
    return true;
  }

  const normalizedValue = value.trim().toLowerCase();
  return (
    normalizedValue !== '0' && normalizedValue !== 'false' && normalizedValue !== 'off' && normalizedValue !== 'no'
  );
};

const getSessionID = (event: OpenCodeEvent): string | undefined => {
  const sessionID = event.properties?.sessionID;
  return typeof sessionID === 'string' ? sessionID : undefined;
};

const isIdleLikeEvent = (event: OpenCodeEvent): boolean => {
  if (event.type === 'session.idle') {
    return true;
  }

  if (event.type !== 'session.status') {
    return false;
  }

  const status = event.properties?.status;
  return status === 'idle' || (isRecord(status) && status.type === 'idle');
};

const getSessionKey = ({ directory, sessionID }: { directory: string; sessionID: string }): string => {
  return `${directory}:${sessionID}`;
};

const removeTrackedSessionState = (sessionKey: string): void => {
  autofixAttemptedFailuresBySession.delete(sessionKey);
  lastCompletedAssistantMessageBySession.delete(sessionKey);
  lastHandledAssistantMessageBySession.delete(sessionKey);
  lastIdleHandledMessageBySession.delete(sessionKey);
  lastIdleSignalBySession.delete(sessionKey);
};

const trackSessionKey = (sessionKey: string): void => {
  const existingIndex = trackedSessionKeys.indexOf(sessionKey);

  if (existingIndex !== -1) {
    trackedSessionKeys.splice(existingIndex, 1);
  }

  trackedSessionKeys.push(sessionKey);

  while (trackedSessionKeys.length > MAX_TRACKED_SESSIONS) {
    const staleSessionIndex = trackedSessionKeys.findIndex(
      (trackedSessionKey) => !inFlightSessions.has(trackedSessionKey),
    );

    if (staleSessionIndex === -1) {
      return;
    }

    const [staleSessionKey] = trackedSessionKeys.splice(staleSessionIndex, 1);
    removeTrackedSessionState(staleSessionKey);
  }
};

const getPartMetadata = (part: Part): Record<string, unknown> | undefined => {
  return part.type === 'text' && isRecord(part.metadata) ? part.metadata : undefined;
};

const getCompletedAssistantMessageFromEvent = (event: OpenCodeEvent): CompletedAssistantMessage | undefined => {
  if (event.type !== 'message.updated') {
    return undefined;
  }

  const message = event.properties?.info;

  if (
    !isRecord(message) ||
    message.role !== 'assistant' ||
    typeof message.sessionID !== 'string' ||
    typeof message.id !== 'string' ||
    !isRecord(message.time) ||
    typeof message.time.completed !== 'number'
  ) {
    return undefined;
  }

  return {
    completedAt: message.time.completed,
    messageID: message.id,
    sessionID: message.sessionID,
  };
};

const getLastCompletedAssistantMessage = async ({
  client,
  sessionID,
}: {
  client: OpenCodeClient;
  sessionID: string;
}): Promise<CompletedAssistantMessage | undefined> => {
  const messages = await client.session.messages({ path: { id: sessionID } });

  for (let index = messages.data.length - 1; index >= 0; index -= 1) {
    const message = messages.data[index];

    if (message.info.role !== 'assistant' || typeof message.info.time.completed !== 'number') {
      continue;
    }

    return {
      completedAt: message.info.time.completed,
      messageID: message.info.id,
      sessionID: message.info.sessionID,
    };
  }

  return undefined;
};

const wasInjectedByPlugin = (message: SessionMessage): boolean => {
  return message.parts.some((part) => {
    const metadata = getPartMetadata(part);

    return metadata?.source === PLUGIN_METADATA_SOURCE && metadata?.reason === PLUGIN_METADATA_REASON;
  });
};

const getLastUserMessage = async ({
  client,
  sessionID,
}: {
  client: OpenCodeClient;
  sessionID: string;
}): Promise<SessionMessage | undefined> => {
  const messages = await client.session.messages({ path: { id: sessionID } });

  for (let index = messages.data.length - 1; index >= 0; index -= 1) {
    const message = messages.data[index];

    if (message.info.role === 'user') {
      return message;
    }
  }

  return undefined;
};

const hasNewerHumanUserMessage = async ({
  assistantCompletedAt,
  client,
  sessionID,
}: {
  assistantCompletedAt: number;
  client: OpenCodeClient;
  sessionID: string;
}): Promise<boolean> => {
  const lastUserMessage = await getLastUserMessage({ client, sessionID });

  return Boolean(
    lastUserMessage &&
      lastUserMessage.info.time.created > assistantCompletedAt &&
      !wasInjectedByPlugin(lastUserMessage),
  );
};

const parseVerifyFailure = (stderr: string): VerifyFailure => {
  const failure = stderr.trim().length > 0 ? stderr.trim() : VERIFY_FAILURE_FALLBACK;
  const lines = failure.split('\n');
  let failureID: string | undefined;

  const messageLines = lines.filter((line) => {
    if (!line.startsWith(FAILURE_ID_PREFIX)) {
      return true;
    }

    const parsedFailureID = line.slice(FAILURE_ID_PREFIX.length).trim();

    if (parsedFailureID.length > 0) {
      failureID = parsedFailureID;
    }

    return false;
  });

  return {
    failureID,
    message: messageLines.join('\n').trim() || VERIFY_FAILURE_FALLBACK,
  };
};

const getStderr = (error: unknown): string => {
  if (!isRecord(error)) {
    return VERIFY_FAILURE_FALLBACK;
  }

  const stderr = error.stderr;

  if (typeof stderr === 'string') {
    return stderr.trim();
  }

  if (stderr instanceof Uint8Array) {
    return Buffer.from(stderr).toString('utf8').trim();
  }

  return VERIFY_FAILURE_FALLBACK;
};

const getAutofixAttempts = (sessionKey: string): Set<string> => {
  const existingAttempts = autofixAttemptedFailuresBySession.get(sessionKey);

  if (existingAttempts) {
    return existingAttempts;
  }

  const attempts = new Set<string>();
  autofixAttemptedFailuresBySession.set(sessionKey, attempts);
  return attempts;
};

const markAutofixAttempted = ({ failureID, sessionKey }: { failureID: string; sessionKey: string }): void => {
  getAutofixAttempts(sessionKey).add(failureID);
};

const hasAttemptedAutofix = ({ failureID, sessionKey }: { failureID: string; sessionKey: string }): boolean => {
  return getAutofixAttempts(sessionKey).has(failureID);
};

const logEvent = async ({
  client,
  level,
  message,
  extra,
}: {
  client: OpenCodeClient;
  extra?: Record<string, unknown>;
  level: 'debug' | 'error' | 'info' | 'warn';
  message: string;
}): Promise<void> => {
  await client.app.log({
    body: {
      service: 'verify-on-idle',
      level,
      message,
      extra,
    },
  });
};

const showErrorToast = async ({ client, message }: { client: OpenCodeClient; message: string }): Promise<void> => {
  await client.tui.showToast({
    body: {
      message,
      variant: 'error',
    },
  });
};

const shouldHandleIdleEvent = ({
  assistantMessageID,
  now,
  sessionKey,
}: {
  assistantMessageID?: string;
  now: number;
  sessionKey: string;
}): boolean => {
  const lastIdleSignalAt = lastIdleSignalBySession.get(sessionKey);
  const lastIdleHandledMessageID = lastIdleHandledMessageBySession.get(sessionKey);

  if (
    assistantMessageID &&
    lastIdleHandledMessageID === assistantMessageID &&
    lastIdleSignalAt &&
    now - lastIdleSignalAt < IDLE_EVENT_DEDUPE_MS
  ) {
    return false;
  }

  lastIdleSignalBySession.set(sessionKey, now);

  if (assistantMessageID) {
    lastIdleHandledMessageBySession.set(sessionKey, assistantMessageID);
  }

  return !inFlightSessions.has(sessionKey);
};

const resolveAssistantMessage = async ({
  client,
  sessionID,
  sessionKey,
}: {
  client: OpenCodeClient;
  sessionID: string;
  sessionKey: string;
}): Promise<CompletedAssistantMessage | undefined> => {
  return (
    lastCompletedAssistantMessageBySession.get(sessionKey) ??
    (await getLastCompletedAssistantMessage({ client, sessionID }))
  );
};

const promptAutofix = async ({
  client,
  failureID,
  sessionID,
  verifyMessage,
}: {
  client: OpenCodeClient;
  failureID: string;
  sessionID: string;
  verifyMessage: string;
}): Promise<void> => {
  await client.session.prompt({
    path: { id: sessionID },
    body: {
      noReply: true,
      parts: [
        {
          type: 'text',
          synthetic: true,
          metadata: {
            failureID,
            reason: PLUGIN_METADATA_REASON,
            source: PLUGIN_METADATA_SOURCE,
          },
          text: verifyMessage,
        },
      ],
    },
  });
};

const runStopVerification = async ({ $, directory }: { $: Shell; directory: string }): Promise<void> => {
  await $`${directory}/tools/verify/verify-on-stop.sh`.quiet();
};

export const VerifyOnIdle = ({ $, directory, client }: VerifyOnIdleContext) => {
  return {
    event: async ({ event }: { event: OpenCodeEvent }): Promise<void> => {
      const completedAssistantMessage = getCompletedAssistantMessageFromEvent(event);

      if (completedAssistantMessage) {
        const sessionKey = getSessionKey({ directory, sessionID: completedAssistantMessage.sessionID });
        trackSessionKey(sessionKey);
        lastCompletedAssistantMessageBySession.set(sessionKey, completedAssistantMessage);
        return;
      }

      if (!isIdleLikeEvent(event)) {
        return;
      }

      const sessionID = getSessionID(event);

      if (!sessionID) {
        return;
      }

      const sessionKey = getSessionKey({ directory, sessionID });
      trackSessionKey(sessionKey);
      const now = Date.now();

      try {
        const latestCompletedAssistantMessage = await resolveAssistantMessage({ client, sessionID, sessionKey });

        if (!latestCompletedAssistantMessage) {
          return;
        }

        if (
          !shouldHandleIdleEvent({ assistantMessageID: latestCompletedAssistantMessage.messageID, now, sessionKey })
        ) {
          return;
        }

        inFlightSessions.add(sessionKey);

        if (lastHandledAssistantMessageBySession.get(sessionKey) === latestCompletedAssistantMessage.messageID) {
          return;
        }

        try {
          await runStopVerification({ $, directory });
          lastHandledAssistantMessageBySession.set(sessionKey, latestCompletedAssistantMessage.messageID);
        } catch (verifyError) {
          const verifyFailure = parseVerifyFailure(getStderr(verifyError));
          const summary = truncate(verifyFailure.message, MAX_ERROR_SUMMARY_CHARS);

          await logEvent({
            client,
            level: 'error',
            message: 'Context-efficient verification failed after an idle-like session event.',
            extra: {
              eventType: event.type,
              failureID: verifyFailure.failureID,
              sessionID,
            },
          });

          await showErrorToast({ client, message: summary });

          if (!verifyFailure.failureID) {
            await logEvent({
              client,
              level: 'warn',
              message: 'Skipped verification autofix because verify-on-stop did not provide a failure id.',
              extra: { sessionID },
            });
            return;
          }

          lastHandledAssistantMessageBySession.set(sessionKey, latestCompletedAssistantMessage.messageID);

          if (!isAutofixEnabled()) {
            await logEvent({
              client,
              level: 'info',
              message: 'Skipped verification autofix because it was disabled for this agent via environment.',
              extra: {
                autofixEnvVar: AUTOFIX_ENV_VAR,
                failureID: verifyFailure.failureID,
                sessionID,
              },
            });
            return;
          }

          if (hasAttemptedAutofix({ failureID: verifyFailure.failureID, sessionKey })) {
            await logEvent({
              client,
              level: 'info',
              message: 'Skipped verification autofix because this failure was already attempted in the session.',
              extra: {
                failureID: verifyFailure.failureID,
                sessionID,
              },
            });
            return;
          }

          if (
            await hasNewerHumanUserMessage({
              assistantCompletedAt: latestCompletedAssistantMessage.completedAt,
              client,
              sessionID,
            })
          ) {
            await logEvent({
              client,
              level: 'info',
              message: 'Skipped verification autofix because a newer human message is present in the session.',
              extra: {
                failureID: verifyFailure.failureID,
                sessionID,
              },
            });
            return;
          }

          try {
            await promptAutofix({
              client,
              failureID: verifyFailure.failureID,
              sessionID,
              verifyMessage: verifyFailure.message,
            });
            markAutofixAttempted({ failureID: verifyFailure.failureID, sessionKey });

            await logEvent({
              client,
              level: 'info',
              message: 'Queued one verification autofix attempt for a fresh failure in the session.',
              extra: {
                failureID: verifyFailure.failureID,
                sessionID,
              },
            });
          } catch (promptError) {
            await logEvent({
              client,
              level: 'error',
              message: 'Verification autofix prompt failed.',
              extra: {
                error:
                  promptError instanceof Error
                    ? promptError.message
                    : 'Unknown error while sending verification autofix prompt.',
                failureID: verifyFailure.failureID,
                sessionID,
              },
            });

            await showErrorToast({
              client,
              message: 'Verification failed and the autofix prompt could not be sent.',
            });
          }
        }
      } catch (error) {
        await logEvent({
          client,
          level: 'error',
          message: 'Verify-on-idle could not inspect the session state before running verification.',
          extra: {
            error: error instanceof Error ? error.message : 'Unknown plugin error while resolving session state.',
            eventType: event.type,
            sessionID,
          },
        });

        await showErrorToast({
          client,
          message: 'Automatic verification could not inspect the session state.',
        });
      } finally {
        inFlightSessions.delete(sessionKey);
      }
    },
  };
};
