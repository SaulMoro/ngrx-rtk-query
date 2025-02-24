import { DestroyRef, computed, effect, inject, isDevMode, signal, untracked } from '@angular/core';
import { type Action, type Selector } from '@reduxjs/toolkit';
import {
  type Api,
  type ApiContext,
  type ApiEndpointMutation,
  type ApiEndpointQuery,
  type CoreModule,
  type EndpointDefinitions,
  type InfiniteQueryActionCreatorResult,
  type InfiniteQueryResultSelectorResult,
  type MutationActionCreatorResult,
  type MutationDefinition,
  type PrefetchOptions,
  type QueryActionCreatorResult,
  type QueryCacheKey,
  type QueryDefinition,
  type QueryKeys,
  type QueryResultSelectorResult,
  QueryStatus,
  type RootState,
  type SerializeQueryArgs,
  defaultSerializeQueryArgs,
  skipToken,
} from '@reduxjs/toolkit/query';

import { UNINITIALIZED_VALUE } from './constants';
import { type AngularHooksModuleOptions } from './module';
import {
  type GenericPrefetchThunk,
  type InfiniteQueryHooks,
  type LazyInfiniteQueryTrigger,
  type MutationHooks,
  type QueryHooks,
  type QueryStateSelector,
  type SubscriptionSelectors,
  type UseInfiniteQueryState,
  type UseInfiniteQueryStateDefaultResult,
  type UseInfiniteQueryStateOptions,
  type UseInfiniteQuerySubscription,
  type UseInfiniteQuerySubscriptionOptions,
  type UseLazyQuerySubscription,
  type UseMutation,
  type UseQueryState,
  type UseQueryStateDefaultResult,
  type UseQueryStateOptions,
  type UseQuerySubscription,
  type UseQuerySubscriptionOptions,
  isInfiniteQueryDefinition,
} from './types';
import { useStableQueryArgs } from './useSerializedStableValue';
import { shallowEqual, signalProxy, toDeepSignal, toLazySignal } from './utils';

/**
 * Wrapper around `defaultQueryStateSelector` to be used in `useQuery`.
 * We want the initial render to already come back with
 * `{ isUninitialized: false, isFetching: true, isLoading: true }`
 * to prevent that the library user has to do an additional check for `isUninitialized`/
 */
const noPendingQueryStateSelector: QueryStateSelector<any, any> = (selected) => {
  if (selected.isUninitialized) {
    return {
      ...selected,
      isUninitialized: false,
      isFetching: true,
      isLoading: selected.data !== undefined ? false : true,
      status: QueryStatus.pending,
    } as any;
  }
  return selected;
};

/**
 *
 * @param opts.api - An API with defined endpoints to create hooks for
 * @param opts.moduleOptions.dispatch - The version of the `dispatch` to be used
 * @param opts.moduleOptions.useSelector - The version of the `useSelector` hook to be used
 * @param opts.moduleOptions.getState - The version of the `getState` to be used
 * @returns An object containing functions to generate hooks based on an endpoint
 */
export function buildHooks<Definitions extends EndpointDefinitions>({
  api,
  moduleOptions: {
    hooks: { dispatch, useSelector, getState },
    createSelector,
  },
  serializeQueryArgs,
  context,
}: {
  api: Api<any, Definitions, any, any, CoreModule>;
  moduleOptions: AngularHooksModuleOptions;
  serializeQueryArgs: SerializeQueryArgs<any>;
  context: ApiContext<Definitions>;
}) {
  return { buildQueryHooks, buildInfiniteQueryHooks, buildMutationHook, usePrefetch };

  function queryStatePreSelector(
    currentState: QueryResultSelectorResult<any>,
    lastResult: UseQueryStateDefaultResult<any> | undefined,
    queryArgs: any,
  ): UseQueryStateDefaultResult<any> {
    // if we had a last result and the current result is uninitialized,
    // we might have called `api.util.resetApiState`
    // in this case, reset the hook
    if (lastResult?.endpointName && currentState.isUninitialized) {
      const { endpointName } = lastResult;
      const endpointDefinition = context.endpointDefinitions[endpointName];
      if (
        queryArgs !== skipToken &&
        serializeQueryArgs({
          queryArgs: lastResult.originalArgs,
          endpointDefinition,
          endpointName,
        }) ===
          serializeQueryArgs({
            queryArgs,
            endpointDefinition,
            endpointName,
          })
      )
        lastResult = undefined;
    }

    // data is the last known good request result we have tracked
    // or if none has been tracked yet the last good result for the current args
    let data = currentState.isSuccess ? currentState.data : lastResult?.data;
    if (data === undefined) data = currentState.data;

    const hasData = data !== undefined;

    // isFetching = true any time a request is in flight
    const isFetching = currentState.isLoading;
    // isLoading = true only when loading while no data is present yet (initial load with no data in the cache)
    const isLoading = (!lastResult || lastResult.isLoading || lastResult.isUninitialized) && !hasData && isFetching;
    // isSuccess = true when data is present and we're not refetching after an error.
    // That includes cases where the _current_ item is either actively
    // fetching or about to fetch due to an uninitialized entry.
    const isSuccess =
      currentState.isSuccess || (hasData && ((isFetching && !lastResult?.isError) || currentState.isUninitialized));

    return {
      ...currentState,
      data,
      currentData: currentState.data,
      isFetching,
      isLoading,
      isSuccess,
      // Deep signals required init properties undefined atleast
      endpointName: currentState.endpointName,
      error: currentState.error,
      fulfilledTimeStamp: currentState.fulfilledTimeStamp,
      originalArgs: currentState.originalArgs,
      requestId: currentState.requestId,
      startedTimeStamp: currentState.startedTimeStamp,
    } as UseQueryStateDefaultResult<any>;
  }

  function infiniteQueryStatePreSelector(
    currentState: InfiniteQueryResultSelectorResult<any>,
    lastResult: UseInfiniteQueryStateDefaultResult<any> | undefined,
    queryArgs: any,
  ): UseInfiniteQueryStateDefaultResult<any> {
    // if we had a last result and the current result is uninitialized,
    // we might have called `api.util.resetApiState`
    // in this case, reset the hook
    if (lastResult?.endpointName && currentState.isUninitialized) {
      const { endpointName } = lastResult;
      const endpointDefinition = context.endpointDefinitions[endpointName];
      if (
        serializeQueryArgs({
          queryArgs: lastResult.originalArgs,
          endpointDefinition,
          endpointName,
        }) ===
        serializeQueryArgs({
          queryArgs,
          endpointDefinition,
          endpointName,
        })
      )
        lastResult = undefined;
    }

    // data is the last known good request result we have tracked - or if none has been tracked yet the last good result for the current args
    let data = currentState.isSuccess ? currentState.data : lastResult?.data;
    if (data === undefined) data = currentState.data;

    const hasData = data !== undefined;

    // isFetching = true any time a request is in flight
    const isFetching = currentState.isLoading;
    // isLoading = true only when loading while no data is present yet (initial load with no data in the cache)
    const isLoading = (!lastResult || lastResult.isLoading || lastResult.isUninitialized) && !hasData && isFetching;
    // isSuccess = true when data is present
    const isSuccess = currentState.isSuccess || (isFetching && hasData);

    return {
      ...currentState,
      data,
      currentData: currentState.data,
      isFetching,
      isLoading,
      isSuccess,
      // Deep signals required init properties undefined atleast
      endpointName: currentState.endpointName,
      error: currentState.error,
      fulfilledTimeStamp: currentState.fulfilledTimeStamp,
      originalArgs: currentState.originalArgs,
      requestId: currentState.requestId,
      startedTimeStamp: currentState.startedTimeStamp,
    } as UseInfiniteQueryStateDefaultResult<any>;
  }

  function usePrefetch<EndpointName extends QueryKeys<Definitions>>(
    endpointName: EndpointName,
    defaultOptions?: PrefetchOptions,
  ) {
    return (arg: any, options?: PrefetchOptions) =>
      dispatch((api.util.prefetch as GenericPrefetchThunk)(endpointName, arg, { ...defaultOptions, ...options }));
  }

  function useQuerySubscriptionCommonImpl<
    T extends QueryActionCreatorResult<any> | InfiniteQueryActionCreatorResult<any>,
  >(endpointName: string, arg: any, options: UseQuerySubscriptionOptions | (() => UseQuerySubscriptionOptions) = {}) {
    const { initiate } = api.endpoints[endpointName] as ApiEndpointQuery<
      QueryDefinition<any, any, any, any, any>,
      Definitions
    >;
    const subscriptionOptions = computed(() => {
      const {
        refetchOnReconnect,
        refetchOnFocus,
        refetchOnMountOrArgChange,
        skip = false,
        pollingInterval = 0,
        skipPollingIfUnfocused = false,
        ...rest
      } = typeof options === 'function' ? options() : options;
      return {
        refetchOnReconnect,
        refetchOnFocus,
        refetchOnMountOrArgChange,
        skip,
        pollingInterval,
        skipPollingIfUnfocused,
        ...rest,
      };
    });
    const subscriptionArg = computed(() => {
      const subscriptionArg = typeof arg === 'function' ? arg() : arg;
      return subscriptionOptions().skip ? skipToken : subscriptionArg;
    });

    let subscriptionSelectorsRef: SubscriptionSelectors | undefined;
    if (!subscriptionSelectorsRef) {
      const returnedValue = dispatch(api.internalActions.internal_getRTKQSubscriptions());
      if (isDevMode()) {
        if (typeof returnedValue !== 'object' || typeof (returnedValue as Action)?.type === 'string') {
          throw new Error(
            `Warning: Middleware for RTK-Query API at reducerPath "${api.reducerPath}" has not been added to the store.
    You must add the middleware for RTK-Query to function correctly!`,
          );
        }
      }

      subscriptionSelectorsRef = returnedValue as unknown as SubscriptionSelectors;
    }

    const stableArg = useStableQueryArgs(
      subscriptionArg,
      // Even if the user provided a per-endpoint `serializeQueryArgs` with
      // a consistent return value, _here_ we want to use the default behavior
      // so we can tell if _anything_ actually changed. Otherwise, we can end up
      // with a case where the query args did change but the serialization doesn't,
      // and then we never try to initiate a refetch.
      defaultSerializeQueryArgs,
      context.endpointDefinitions[endpointName],
      endpointName,
    );
    const stableSubscriptionOptions = computed(
      () => {
        const { refetchOnReconnect, refetchOnFocus, pollingInterval, skipPollingIfUnfocused } = subscriptionOptions();
        return { refetchOnReconnect, refetchOnFocus, pollingInterval, skipPollingIfUnfocused };
      },
      { equal: shallowEqual },
    );

    let lastRenderHadSubscription = false;

    const promiseRef: { current: T | undefined } = { current: undefined };

    const forceRefetch = computed(() => subscriptionOptions().refetchOnMountOrArgChange);
    const initialPageParam = computed(
      () => (subscriptionOptions() as UseInfiniteQuerySubscriptionOptions<any>).initialPageParam,
    );

    effect(
      () => {
        const { queryCacheKey, requestId } = promiseRef.current || {};
        const stableArgValue = stableArg();
        const stableSubscriptionOptionsValue = stableSubscriptionOptions();
        const forceRefetchValue = forceRefetch();
        const initialPageParamValue = initialPageParam();

        // HACK We've saved the middleware subscription lookup callbacks into a ref,
        // so we can directly check here if the subscription exists for this query.
        let currentRenderHasSubscription = false;
        if (queryCacheKey && requestId) {
          currentRenderHasSubscription = !!subscriptionSelectorsRef?.isRequestSubscribed(queryCacheKey, requestId);
        }

        const subscriptionRemoved = !currentRenderHasSubscription && lastRenderHadSubscription;
        lastRenderHadSubscription = currentRenderHasSubscription;
        if (subscriptionRemoved) {
          promiseRef.current = undefined;
        }

        const lastPromise = promiseRef;
        if (stableArgValue === skipToken) {
          lastPromise.current?.unsubscribe();
          promiseRef.current = undefined;
          return;
        }

        const lastSubscriptionOptions = promiseRef.current?.subscriptionOptions;

        if (!lastPromise.current || lastPromise.current.arg !== stableArgValue) {
          lastPromise.current?.unsubscribe();
          const promise = dispatch(
            initiate(stableArgValue, {
              subscriptionOptions: stableSubscriptionOptionsValue,
              forceRefetch: forceRefetchValue,
              ...(isInfiniteQueryDefinition(context.endpointDefinitions[endpointName])
                ? {
                    initialPageParam: initialPageParamValue,
                  }
                : {}),
            }),
          );

          promiseRef.current = promise as T;
        } else if (stableSubscriptionOptionsValue !== lastSubscriptionOptions) {
          lastPromise.current.updateSubscriptionOptions(stableSubscriptionOptionsValue);
        }
      },
      { allowSignalWrites: true },
    );

    return [promiseRef, dispatch, initiate, stableSubscriptionOptions] as const;
  }

  function buildUseQueryState(
    endpointName: string,
    preSelector: typeof queryStatePreSelector | typeof infiniteQueryStatePreSelector,
  ) {
    const useQueryState = (
      arg: any,
      options:
        | UseQueryStateOptions<any, any>
        | UseInfiniteQueryStateOptions<any, any>
        | (() => UseQueryStateOptions<any, any>)
        | (() => UseInfiniteQueryStateOptions<any, any>) = {},
    ) => {
      const { select } = api.endpoints[endpointName] as ApiEndpointQuery<
        QueryDefinition<any, any, any, any, any>,
        Definitions
      >;
      // We need to use `toLazySignal` here to prevent 'signal required inputs' errors
      const lazyArg = typeof arg === 'function' ? toLazySignal(arg, { initialValue: skipToken }) : () => arg;
      const lazyOptions =
        typeof options === 'function'
          ? toLazySignal(options, { initialValue: { selectFromResult: noPendingQueryStateSelector } })
          : () => options;

      const stateOptions = computed(() => {
        const { skip = false, selectFromResult } = lazyOptions();
        return { skip, selectFromResult };
      });
      const subscriptionArg = computed(() => {
        const subscriptionArg = lazyArg();
        return stateOptions().skip ? skipToken : subscriptionArg;
      });

      const stableArg = useStableQueryArgs(
        subscriptionArg,
        serializeQueryArgs,
        context.endpointDefinitions[endpointName],
        endpointName,
      );

      let lastValue: any;

      const currentState = computed(() => {
        const selectDefaultResult = createSelector(select(stableArg()), (subState: any) =>
          preSelector(subState, lastValue, stableArg()),
        );
        const { selectFromResult } = stateOptions();

        const querySelector = selectFromResult
          ? createSelector(selectDefaultResult, selectFromResult)
          : selectDefaultResult;

        const currentState = useSelector((state: RootState<Definitions, any, any>) => querySelector(state), {
          equal: shallowEqual,
        });

        lastValue = selectDefaultResult(getState());
        return currentState();
      });
      const deepSignal = toDeepSignal(currentState);

      return deepSignal as any;
    };

    return useQueryState;
  }

  function usePromiseRefUnsubscribeOnUnmount(promiseRef: { current: { unsubscribe?: () => void } | undefined }) {
    inject(DestroyRef).onDestroy(() => {
      promiseRef.current?.unsubscribe?.();
      promiseRef.current = undefined;
    });
  }

  function refetchOrErrorIfUnmounted<
    T extends QueryActionCreatorResult<any> | InfiniteQueryActionCreatorResult<any>,
  >(promiseRef: { current: T | undefined }): T {
    if (!promiseRef.current) throw new Error('Cannot refetch a query that has not been started yet.');
    return promiseRef.current.refetch() as T;
  }

  function buildQueryHooks(endpointName: string): QueryHooks<any> {
    const useQuerySubscription: UseQuerySubscription<any> = (arg: any, options = {}) => {
      const [promiseRef] = useQuerySubscriptionCommonImpl<QueryActionCreatorResult<any>>(endpointName, arg, options);

      usePromiseRefUnsubscribeOnUnmount(promiseRef);

      return {
        /**
         * A method to manually refetch data for the query
         */
        refetch: () => refetchOrErrorIfUnmounted(promiseRef),
      };
    };

    const useLazyQuerySubscription: UseLazyQuerySubscription<any> = (options = {}) => {
      const { initiate } = api.endpoints[endpointName] as ApiEndpointQuery<
        QueryDefinition<any, any, any, any, any>,
        Definitions
      >;
      const subscriptionArg = signal<any>(UNINITIALIZED_VALUE);
      let promiseRef: QueryActionCreatorResult<any> | undefined;

      const stableSubscriptionOptions = computed(
        () => {
          const {
            refetchOnReconnect,
            refetchOnFocus,
            pollingInterval = 0,
            skipPollingIfUnfocused = false,
          } = typeof options === 'function' ? options() : options;
          return { refetchOnReconnect, refetchOnFocus, pollingInterval, skipPollingIfUnfocused };
        },
        { equal: shallowEqual },
      );

      effect(
        () => {
          const lastSubscriptionOptions = promiseRef?.subscriptionOptions;

          if (stableSubscriptionOptions() !== lastSubscriptionOptions) {
            promiseRef?.updateSubscriptionOptions(stableSubscriptionOptions());
          }
        },
        { allowSignalWrites: true },
      );

      let subscriptionOptionsRef = stableSubscriptionOptions();
      effect(() => {
        subscriptionOptionsRef = stableSubscriptionOptions();
      });

      const trigger = (arg: any, { preferCacheValue = false } = {}) => {
        let promise: QueryActionCreatorResult<any>;

        promiseRef?.unsubscribe();
        promiseRef = promise = dispatch(
          initiate(arg, { subscriptionOptions: subscriptionOptionsRef, forceRefetch: !preferCacheValue }),
        );

        subscriptionArg.set(arg);

        return promise;
      };

      const reset = () => {
        if (promiseRef?.queryCacheKey) {
          dispatch(
            api.internalActions.removeQueryResult({
              queryCacheKey: promiseRef?.queryCacheKey as QueryCacheKey,
            }),
          );
        }
      };

      /* cleanup on unmount */
      inject(DestroyRef).onDestroy(() => {
        promiseRef?.unsubscribe();
      });

      /* if "cleanup on unmount" was triggered from a fast refresh, we want to reinstate the query */
      effect(() => {
        if (subscriptionArg() !== UNINITIALIZED_VALUE && !promiseRef) {
          trigger(subscriptionArg(), { preferCacheValue: true });
        }
      });

      const lastArg = computed(() => (subscriptionArg() !== UNINITIALIZED_VALUE ? subscriptionArg() : skipToken), {
        equal: shallowEqual,
      });

      return [trigger, lastArg, { reset }] as const;
    };

    const useQueryState: UseQueryState<any> = buildUseQueryState(endpointName, queryStatePreSelector);

    return {
      useQueryState,
      useQuerySubscription,
      useLazyQuerySubscription,
      useLazyQuery(options) {
        const [trigger, arg, { reset }] = useLazyQuerySubscription(options);
        const subscriptionOptions = computed(() => ({
          ...options,
          skip: arg() === UNINITIALIZED_VALUE,
        }));
        const queryStateResults = useQueryState(arg, subscriptionOptions);
        const signalsMap = signalProxy(queryStateResults);
        Object.assign(trigger, { lastArg: arg, reset });
        Object.assign(trigger, signalsMap);

        return trigger as any;
      },
      useQuery(arg, options) {
        const querySubscriptionResults = useQuerySubscription(arg, options);
        const subscriptionOptions = computed(() => {
          const subscriptionArg = typeof arg === 'function' ? arg() : arg;
          const subscriptionOptions = typeof options === 'function' ? options() : options;
          return {
            selectFromResult:
              subscriptionArg === skipToken || subscriptionOptions?.skip ? undefined : noPendingQueryStateSelector,
            ...subscriptionOptions,
          };
        });
        const queryStateResults = useQueryState(arg, subscriptionOptions);
        Object.assign(queryStateResults, querySubscriptionResults);

        return queryStateResults as any;
      },
    };
  }

  function buildInfiniteQueryHooks(endpointName: string): InfiniteQueryHooks<any> {
    const useInfiniteQuerySubscription: UseInfiniteQuerySubscription<any> = (arg: any, options = {}) => {
      const [promiseRef, dispatch, initiate, stableSubscriptionOptions] = useQuerySubscriptionCommonImpl<
        InfiniteQueryActionCreatorResult<any>
      >(endpointName, arg, options);

      let subscriptionOptionsRef = stableSubscriptionOptions();
      effect(() => {
        subscriptionOptionsRef = stableSubscriptionOptions();
      });

      const trigger: LazyInfiniteQueryTrigger<any> = (arg: unknown, direction: 'forward' | 'backward') => {
        let promise: InfiniteQueryActionCreatorResult<any>;

        promiseRef.current?.unsubscribe();

        promiseRef.current = promise = dispatch(
          (initiate as any)(arg, {
            subscriptionOptions: subscriptionOptionsRef,
            direction,
          }),
        );

        return promise;
      };

      usePromiseRefUnsubscribeOnUnmount(promiseRef);

      const fetchNextPage = () => {
        return trigger(arg, 'forward');
      };

      const fetchPreviousPage = () => {
        return trigger(arg, 'backward');
      };

      return {
        trigger,
        /**
         * A method to manually refetch data for the query
         */
        refetch: () => refetchOrErrorIfUnmounted(promiseRef),
        fetchNextPage,
        fetchPreviousPage,
      };
    };

    const useInfiniteQueryState: UseInfiniteQueryState<any> = buildUseQueryState(
      endpointName,
      infiniteQueryStatePreSelector,
    );

    return {
      useInfiniteQueryState,
      useInfiniteQuerySubscription,
      useInfiniteQuery(arg, options) {
        const { refetch, fetchNextPage, fetchPreviousPage } = useInfiniteQuerySubscription(arg, options);
        const subscriptionOptions = computed(() => {
          const subscriptionArg = typeof arg === 'function' ? arg() : arg;
          const subscriptionOptions = typeof options === 'function' ? options() : options;
          return {
            selectFromResult:
              subscriptionArg === skipToken || subscriptionOptions?.skip ? undefined : noPendingQueryStateSelector,
            ...subscriptionOptions,
          };
        });
        const queryStateResults = useInfiniteQueryState(arg, subscriptionOptions);

        Object.assign(queryStateResults, { fetchNextPage, fetchPreviousPage, refetch });

        return queryStateResults as any;
      },
    };
  }

  function buildMutationHook(name: string): MutationHooks<any> {
    const { initiate, select } = api.endpoints[name] as ApiEndpointMutation<
      MutationDefinition<any, any, any, any, any>,
      Definitions
    >;

    const useMutation: UseMutation<any> = ({ selectFromResult, fixedCacheKey } = {}) => {
      const promiseRef = signal<MutationActionCreatorResult<any> | undefined>(undefined);

      effect((onCleanup) => {
        const currentPromise = promiseRef();
        onCleanup(() => {
          if (!currentPromise?.arg.fixedCacheKey) {
            untracked(() => currentPromise?.reset());
          }
        });
      });

      const triggerMutation = (arg: Parameters<typeof initiate>['0']) => {
        const promise = dispatch(initiate(arg, { fixedCacheKey }));
        promiseRef.set(promise);
        return promise;
      };

      const fixedSelect: typeof select = (args) => (state) => {
        const currentState = select(args)(state);
        return {
          ...currentState,
          // Deep signals required init properties undefined atleast
          data: currentState.data,
          endpointName: currentState.endpointName,
          error: currentState.error,
          fulfilledTimeStamp: currentState.fulfilledTimeStamp,
          requestId: currentState.requestId,
          startedTimeStamp: currentState.startedTimeStamp,
        } as any;
      };

      const requestId = computed(() => promiseRef()?.requestId);
      const selectDefaultResult = (requestId?: string) => fixedSelect({ fixedCacheKey, requestId });
      const mutationSelector = (requestId?: string): Selector<RootState<Definitions, any, any>, any> =>
        selectFromResult
          ? createSelector(selectDefaultResult(requestId), selectFromResult)
          : selectDefaultResult(requestId);

      const currentState = computed(() => useSelector(mutationSelector(requestId()), { equal: shallowEqual }));
      const originalArgs = computed(() => (fixedCacheKey == null ? promiseRef()?.arg.originalArgs : undefined));
      const reset = () => {
        if (promiseRef()) {
          promiseRef.set(undefined);
        }
        if (fixedCacheKey) {
          dispatch(
            api.internalActions.removeMutationResult({
              requestId: requestId(),
              fixedCacheKey,
            }),
          );
        }
      };

      const finalState = computed(() => currentState()());
      const signalsMap = signalProxy(finalState);
      Object.assign(triggerMutation, { originalArgs });
      Object.assign(triggerMutation, { reset });
      Object.assign(triggerMutation, signalsMap);

      return triggerMutation as any;
    };

    return { useMutation };
  }
}
