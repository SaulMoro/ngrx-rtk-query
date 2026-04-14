import { setupListeners as setupListenersFn } from '@reduxjs/toolkit/query';

import { type Dispatch } from './module';
import { type StoreQueryConfig } from './types';

type SetupListenersHandler = NonNullable<Parameters<typeof setupListenersFn>[1]>;
type ListenerActions = Parameters<SetupListenersHandler>[1];

const dispatchCounts = new Map<Dispatch, number>();
let teardownListeners: (() => void) | undefined;

const addDispatch = (dispatch: Dispatch) => {
  dispatchCounts.set(dispatch, (dispatchCounts.get(dispatch) ?? 0) + 1);
};

const removeDispatch = (dispatch: Dispatch) => {
  const nextCount = (dispatchCounts.get(dispatch) ?? 0) - 1;

  if (nextCount > 0) {
    dispatchCounts.set(dispatch, nextCount);
    return;
  }

  dispatchCounts.delete(dispatch);
};

const broadcast = (action: ReturnType<ListenerActions[keyof ListenerActions]>) => {
  for (const dispatch of dispatchCounts.keys()) {
    dispatch(action);
  }
};

const createDefaultListeners = (actions: ListenerActions) => {
  if (typeof window === 'undefined' || !window.addEventListener) {
    return () => undefined;
  }

  const handleFocus = () => broadcast(actions.onFocus());
  const handleFocusLost = () => broadcast(actions.onFocusLost());
  const handleOnline = () => broadcast(actions.onOnline());
  const handleOffline = () => broadcast(actions.onOffline());
  const handleVisibilityChange = () => {
    if (window.document.visibilityState === 'visible') {
      handleFocus();
      return;
    }

    handleFocusLost();
  };
  const handlers = {
    focus: handleFocus,
    visibilitychange: handleVisibilityChange,
    online: handleOnline,
    offline: handleOffline,
  };

  for (const [eventName, handler] of Object.entries(handlers)) {
    window.addEventListener(eventName, handler, false);
  }

  return () => {
    for (const [eventName, handler] of Object.entries(handlers)) {
      window.removeEventListener(eventName, handler);
    }
  };
};

export const setupRuntimeListeners = (dispatch: Dispatch, setupListeners?: StoreQueryConfig['setupListeners']) => {
  if (setupListeners === false) {
    return undefined;
  }

  if (setupListeners) {
    return setupListenersFn(dispatch as never, setupListeners);
  }

  return setupListenersFn(dispatch as never, (_, actions) => {
    addDispatch(dispatch);
    teardownListeners ??= createDefaultListeners(actions);

    return () => {
      removeDispatch(dispatch);

      if (dispatchCounts.size === 0) {
        teardownListeners?.();
        teardownListeners = undefined;
      }
    };
  });
};
