import { vi } from 'vitest';

type RuntimeLifecycleApi = {
  dispatch: (action: unknown) => unknown;
  util: {
    resetApiState: {
      match: (action: unknown) => boolean;
    };
  };
};

export const recordRuntimeLifecycle = (api: RuntimeLifecycleApi) => {
  const events: string[] = [];
  const dispatch = api.dispatch;
  vi.spyOn(api, 'dispatch').mockImplementation((action) => {
    if (api.util.resetApiState.match(action)) {
      events.push('reset');
    }

    return dispatch(action);
  });
  const setupListeners = vi.fn(() => {
    events.push('listeners');

    return () => {
      events.push('teardown');
    };
  });

  return { events, setupListeners };
};
