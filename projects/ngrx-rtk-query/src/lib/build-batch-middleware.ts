import { AnyAction } from '@reduxjs/toolkit';
import { SubscriptionState } from '@reduxjs/toolkit/dist/query/core/apiState';
import {
  ApiMiddlewareInternalHandler,
  BuildSubMiddlewareInput,
} from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types';
import { produceWithPatches } from 'immer';

// Copied from https://github.com/feross/queue-microtask
let promise: Promise<any>;
const queueMicrotaskShim =
  typeof queueMicrotask === 'function'
    ? queueMicrotask.bind(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : globalThis)
    : // reuse resolved promise, and allocate it lazily
      (cb: () => void) =>
        (promise || (promise = Promise.resolve())).then(cb).catch((err: any) =>
          setTimeout(() => {
            throw err;
          }, 0),
        );

type CustomInternalHandlerBuilder<ReturnType = void> = (
  input: Pick<BuildSubMiddlewareInput, 'api' | 'internalState'>,
) => ApiMiddlewareInternalHandler<ReturnType>;

export const buildBatchedActionsHandler: CustomInternalHandlerBuilder<
  [actionShouldContinue: boolean, subscriptionExists: boolean]
> = ({ api, internalState }) => {
  const subscriptionsPrefix = `${api.reducerPath}/subscriptions`;

  let previousSubscriptions: SubscriptionState = null as unknown as SubscriptionState;

  let dispatchQueued = false;

  const { updateSubscriptionOptions, unsubscribeQueryResult } = api.internalActions;

  // Actually intentionally mutate the subscriptions state used in the middleware
  // This is done to speed up perf when loading many components
  const actuallyMutateSubscriptions = (mutableState: SubscriptionState, action: AnyAction) => {
    if (updateSubscriptionOptions.match(action)) {
      const { queryCacheKey, requestId, options } = action.payload;

      if (mutableState?.[queryCacheKey]?.[requestId]) {
        mutableState[queryCacheKey]![requestId] = options;
      }
      return true;
    }
    if (unsubscribeQueryResult.match(action)) {
      const { queryCacheKey, requestId } = action.payload;
      if (mutableState[queryCacheKey]) {
        delete mutableState[queryCacheKey]![requestId];
      }
      return true;
    }
    if (api.internalActions.removeQueryResult.match(action)) {
      delete mutableState[action.payload.queryCacheKey];
      return true;
    }
    if (action.type.endsWith('/pending')) {
      const {
        meta: { arg, requestId },
      } = action;
      if (arg.subscribe) {
        const substate = (mutableState[arg.queryCacheKey] ??= {});
        substate[requestId] = arg.subscriptionOptions ?? substate[requestId] ?? {};

        return true;
      }
    }
    if (action.type.endsWith('/rejected')) {
      const {
        meta: { condition, arg, requestId },
      } = action;
      if (condition && arg.subscribe) {
        const substate = (mutableState[arg.queryCacheKey] ??= {});
        substate[requestId] = arg.subscriptionOptions ?? substate[requestId] ?? {};

        return true;
      }
    }

    return false;
  };

  return (action, mwApi) => {
    if (!previousSubscriptions) {
      // Initialize it the first time this handler runs
      previousSubscriptions = JSON.parse(JSON.stringify(internalState.currentSubscriptions));
    }

    if (api.util.resetApiState.match(action)) {
      previousSubscriptions = internalState.currentSubscriptions = {};
      return [true, false];
    }

    // Intercept requests by hooks to see if they're subscribed
    // Necessary because we delay updating store state to the end of the tick
    if (api.internalActions.internal_probeSubscription.match(action)) {
      const { queryCacheKey, requestId } = action.payload;
      const hasSubscription = !!internalState.currentSubscriptions[queryCacheKey]?.[requestId];
      return [false, hasSubscription];
    }

    // Update subscription data based on this action
    const didMutate = actuallyMutateSubscriptions(internalState.currentSubscriptions, action);

    if (didMutate) {
      if (!dispatchQueued) {
        queueMicrotaskShim(() => {
          // Deep clone the current subscription data
          const newSubscriptions: SubscriptionState = JSON.parse(JSON.stringify(internalState.currentSubscriptions));
          // Figure out a smaller diff between original and current
          const [, patches] = produceWithPatches(previousSubscriptions, () => newSubscriptions);

          // Sync the store state for visibility
          mwApi.next(api.internalActions.subscriptionsUpdated(patches));
          // Save the cloned state for later reference
          previousSubscriptions = newSubscriptions;
          dispatchQueued = false;
        });
        dispatchQueued = true;
      }

      const isSubscriptionSliceAction = !!action.type?.startsWith(subscriptionsPrefix);
      const isAdditionalSubscriptionAction =
        action.type.endsWith('/rejected') && action.meta.condition && !!action.meta.arg.subscribe;

      const actionShouldContinue = !isSubscriptionSliceAction && !isAdditionalSubscriptionAction;

      return [actionShouldContinue, false];
    }

    return [true, false];
  };
};
