import { type UnknownAction } from '@reduxjs/toolkit';

import { type AngularHooksModuleOptions, type Dispatch } from './module';
import { setupRuntimeListeners } from './setup-runtime-listeners';
import { type StoreQueryConfig } from './types';

/** @internal */
export type ɵInternalRuntimeMountApi = {
  dispatch: Dispatch;
  initApiStore: (
    setupFn: () => AngularHooksModuleOptions,
    bindingMetadata: {
      bindingKey: object;
      runtimeLabel: string;
    },
  ) => () => void;
  util: {
    resetApiState: () => UnknownAction;
  };
};

/** @internal */
export type ɵInternalRuntimeMountOptions = {
  api: ɵInternalRuntimeMountApi;
  setupFn: () => AngularHooksModuleOptions;
  bindingKey: object;
  runtimeLabel: string;
  setupListeners?: StoreQueryConfig['setupListeners'];
};

export function ɵinternalMountRuntimeApi({
  api,
  setupFn,
  bindingKey,
  runtimeLabel,
  setupListeners,
}: ɵInternalRuntimeMountOptions): () => void {
  let releaseApiStore: (() => void) | undefined;
  let teardownListeners: (() => void) | undefined;

  try {
    releaseApiStore = api.initApiStore(setupFn, { bindingKey, runtimeLabel });
    teardownListeners = setupRuntimeListeners(api.dispatch, setupListeners);
  } catch (error) {
    teardownListeners?.();
    releaseApiStore?.();

    throw error;
  }

  return () => {
    let cleanupError: unknown;
    let hasCleanupError = false;
    const runCleanup = (cleanup: (() => void) | undefined) => {
      try {
        cleanup?.();
      } catch (error) {
        if (!hasCleanupError) {
          cleanupError = error;
          hasCleanupError = true;
        }
      }
    };

    runCleanup(teardownListeners);
    runCleanup(() => {
      api.dispatch(api.util.resetApiState());
    });
    runCleanup(releaseApiStore);

    if (hasCleanupError) {
      throw cleanupError;
    }
  };
}
