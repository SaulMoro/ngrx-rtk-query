import type { Api, EndpointDefinitions, MutationDefinition, QueryDefinition } from '@reduxjs/toolkit/query';
import { skipToken, QueryStatus } from '@reduxjs/toolkit/query';
import type { QueryKeys, RootState } from '@reduxjs/toolkit/dist/query/core/apiState';
import type {
  MutationActionCreatorResult,
  QueryActionCreatorResult,
} from '@reduxjs/toolkit/dist/query/core/buildInitiate';
import type {
  ApiEndpointMutation,
  ApiEndpointQuery,
  CoreModule,
  PrefetchOptions,
} from '@reduxjs/toolkit/dist/query/core/module';
import type { QueryResultSelectorResult } from '@reduxjs/toolkit/dist/query/core/buildSelectors';
import { SerializeQueryArgs } from '@reduxjs/toolkit/dist/query/defaultSerializeQueryArgs';
import { ApiContext } from '@reduxjs/toolkit/dist/query/apiTypes';
import { createSelectorFactory, resultMemoize } from '@ngrx/store';
import { BehaviorSubject, of, isObservable, combineLatest } from 'rxjs';
import { distinctUntilChanged, finalize, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import type { AngularHooksModuleOptions } from './module';
import type {
  GenericPrefetchThunk,
  MutationStateSelector,
  QueryHooks,
  QueryStateSelector,
  UseLazyQuery,
  UseLazyQueryLastPromiseInfo,
  UseLazyQuerySubscription,
  UseLazyTrigger,
  UseMutation,
  UseQuery,
  UseQueryState,
  UseQueryStateDefaultResult,
  UseQuerySubscription,
} from './types';
import { UNINITIALIZED_VALUE } from './constants';
import { shallowEqual } from './utils';
import { getState } from './thunk.service';
import { useStableQueryArgs } from './useSerializedStableValue';

const defaultQueryStateSelector: QueryStateSelector<any, any> = (x) => x;
const defaultMutationStateSelector: MutationStateSelector<any, any> = (x) => x;

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
 * @param opts.moduleOptions.useDispatch - The version of the `useDispatch` hook to be used
 * @param opts.moduleOptions.useSelector - The version of the `useSelector` hook to be used
 * @returns An object containing functions to generate hooks based on an endpoint
 */
export function buildHooks<Definitions extends EndpointDefinitions>({
  api,
  moduleOptions: { useDispatch: dispatch, useSelector },
  serializeQueryArgs,
  context,
}: {
  api: Api<any, Definitions, any, any, CoreModule>;
  moduleOptions: Required<AngularHooksModuleOptions>;
  serializeQueryArgs: SerializeQueryArgs<any>;
  context: ApiContext<Definitions>;
}) {
  return { buildQueryHooks, buildMutationHook, usePrefetch };

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
    const isLoading = !hasData && isFetching;
    // isSuccess = true when data is present
    const isSuccess = currentState.isSuccess || (isFetching && hasData);

    return {
      ...currentState,
      data,
      currentData: currentState.data,
      isFetching,
      isLoading,
      isSuccess,
    } as UseQueryStateDefaultResult<any>;
  }

  function usePrefetch<EndpointName extends QueryKeys<Definitions>>(
    endpointName: EndpointName,
    defaultOptions?: PrefetchOptions,
  ) {
    return (arg: any, options?: PrefetchOptions) =>
      dispatch((api.util.prefetch as GenericPrefetchThunk)(endpointName, arg, { ...defaultOptions, ...options }));
  }

  function buildQueryHooks(name: string): QueryHooks<any> {
    const { initiate, select } = api.endpoints[name] as ApiEndpointQuery<
      QueryDefinition<any, any, any, any, any>,
      Definitions
    >;

    const useQuerySubscription: UseQuerySubscription<any> = (
      arg: any,
      { refetchOnReconnect, refetchOnFocus, refetchOnMountOrArgChange, skip = false, pollingInterval = 0 } = {},
      promiseRef = {},
      argCacheRef = {},
    ) => {
      const stableArg = useStableQueryArgs(
        skip ? skipToken : arg,
        serializeQueryArgs,
        context.endpointDefinitions[name],
        name,
        argCacheRef,
      );
      const subscriptionOptions = { refetchOnReconnect, refetchOnFocus, pollingInterval };

      const { queryCacheKey, requestId } = promiseRef.current || {};
      useSelector(
        (state: RootState<Definitions, string, string>) =>
          !!queryCacheKey && !!requestId && !state[api.reducerPath].subscriptions[queryCacheKey]?.[requestId],
      )
        .pipe(take(1))
        .subscribe((subscriptionRemoved) => {
          if (subscriptionRemoved) {
            promiseRef.current?.unsubscribe();
            promiseRef.current = undefined;
          }
        });

      if (stableArg !== skipToken && stableArg !== UNINITIALIZED_VALUE) {
        const lastPromise = promiseRef?.current;
        const lastSubscriptionOptions = promiseRef.current?.subscriptionOptions;

        if (!lastPromise || !shallowEqual(lastPromise.arg, stableArg)) {
          lastPromise?.unsubscribe();
          promiseRef.current = dispatch(
            initiate(stableArg, { subscriptionOptions, forceRefetch: refetchOnMountOrArgChange }),
          );
        } else if (!shallowEqual(subscriptionOptions, lastSubscriptionOptions)) {
          lastPromise.updateSubscriptionOptions(subscriptionOptions);
        }
      }

      return {
        /**
         * A method to manually refetch data for the query
         */
        refetch: () => void promiseRef.current?.refetch(),
      };
    };

    const useLazyQuerySubscription: UseLazyQuerySubscription<any> = (
      { refetchOnReconnect, refetchOnFocus, pollingInterval = 0 } = {},
      promiseRef = {},
    ) => {
      let argState: any = UNINITIALIZED_VALUE;
      const subscriptionOptions = { refetchOnReconnect, refetchOnFocus, pollingInterval };

      const lastSubscriptionOptions = promiseRef.current?.subscriptionOptions;
      if (!shallowEqual(subscriptionOptions, lastSubscriptionOptions)) {
        promiseRef.current?.updateSubscriptionOptions(subscriptionOptions);
      }

      const trigger: UseLazyTrigger<any> = (arg: any, { preferCacheValue = false } = {}) => {
        promiseRef.current?.unsubscribe();

        promiseRef.current = dispatch(initiate(arg, { subscriptionOptions, forceRefetch: !preferCacheValue }));
        argState = arg;
      };

      /* if "cleanup on unmount" was triggered from a fast refresh, we want to reinstate the query */
      if (argState !== UNINITIALIZED_VALUE && !promiseRef.current) {
        trigger(argState, { preferCacheValue: true });
      }

      return [trigger, argState] as const;
    };

    const useQueryState: UseQueryState<any> = (
      arg: any,
      { skip = false, selectFromResult = defaultQueryStateSelector } = {},
      lastValue = {},
      argCacheRef = {},
    ) => {
      const arg$ = isObservable(arg) ? arg : of(arg);
      return arg$.pipe(
        map((currentArg) =>
          useStableQueryArgs(
            skip || currentArg === UNINITIALIZED_VALUE ? skipToken : currentArg,
            serializeQueryArgs,
            context.endpointDefinitions[name],
            name,
            argCacheRef,
          ),
        ),
        distinctUntilChanged(shallowEqual),
        switchMap((stableArg) => {
          const selectDefaultResult = createSelectorFactory((projector) => resultMemoize(projector, shallowEqual))(
            select(stableArg),
            (subState: any) => queryStatePreSelector(subState, lastValue.current, stableArg),
          );

          const querySelector = createSelectorFactory((projector) => resultMemoize(projector, shallowEqual))(
            selectDefaultResult,
            selectFromResult,
          );

          return useSelector((state: RootState<Definitions, any, any>) => querySelector(state)).pipe(
            tap(() => (lastValue.current = selectDefaultResult(getState()))),
          );
        }),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
      );
    };

    const useQuery: UseQuery<any> = (arg, options) => {
      // Refs
      const promiseRef: { current?: QueryActionCreatorResult<any> } = {};
      const lastValue: { current?: any } = {};
      const argRef: { current?: any } = {};

      const arg$ = isObservable(arg) ? arg : of(arg);
      const options$ = isObservable(options) ? options : of(options);

      return combineLatest([
        arg$.pipe(distinctUntilChanged(shallowEqual)),
        options$.pipe(distinctUntilChanged((prev, curr) => shallowEqual(prev, curr))),
      ]).pipe(
        switchMap(([currentArg, currentOptions]) => {
          const querySubscriptionResults = useQuerySubscription(currentArg, currentOptions, promiseRef, argRef);
          const queryStateResults$ = useQueryState(
            currentArg,
            {
              selectFromResult:
                currentArg === skipToken || currentArg === UNINITIALIZED_VALUE || currentOptions?.skip
                  ? undefined
                  : noPendingQueryStateSelector,
              ...currentOptions,
            },
            lastValue,
            argRef,
          );
          return queryStateResults$.pipe(map((queryState) => ({ ...queryState, ...querySubscriptionResults })));
        }),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
        finalize(() => {
          void promiseRef.current?.unsubscribe();
          promiseRef.current = undefined;
        }),
      );
    };

    const useLazyQuery: UseLazyQuery<any> = (options) => {
      // Refs
      const promiseRef: { current?: QueryActionCreatorResult<any> } = {};
      const lastValue: { current?: any } = {};
      const triggerRef: { current?: UseLazyTrigger<any> } = {};
      const argRef: { current?: any } = {};

      const infoSubject = new BehaviorSubject<UseLazyQueryLastPromiseInfo<any>>({ lastArg: UNINITIALIZED_VALUE });
      const info$ = infoSubject.asObservable();
      const options$ = isObservable(options) ? options : of(options);

      const state$ = combineLatest([
        options$.pipe(
          distinctUntilChanged((prev, curr) => shallowEqual(prev, curr)),
          tap((currentOptions) => {
            const [trigger] = useLazyQuerySubscription(currentOptions, promiseRef);
            triggerRef.current = trigger;
          }),
        ),
        info$.pipe(
          tap(({ lastArg, extra }) => {
            if (lastArg !== UNINITIALIZED_VALUE) {
              triggerRef.current?.(lastArg, extra);
            }
          }),
          map(({ lastArg }) => lastArg),
          distinctUntilChanged(shallowEqual),
        ),
      ]).pipe(
        switchMap(([currentOptions, currentArg]) =>
          useQueryState(
            currentArg,
            {
              ...currentOptions,
              skip: currentArg === UNINITIALIZED_VALUE,
            },
            lastValue,
            argRef,
          ),
        ),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
        finalize(() => {
          void promiseRef.current?.unsubscribe();
          promiseRef.current = undefined;
        }),
      );

      return {
        fetch: (arg, extra) => infoSubject.next({ lastArg: arg, extra }),
        state$,
        lastArg$: info$.pipe(map(({ lastArg }) => lastArg)),
      };
    };

    return {
      useQueryState,
      useQuerySubscription,
      useLazyQuerySubscription,
      useLazyQuery,
      useQuery,
    };
  }

  function buildMutationHook(name: string): UseMutation<any> {
    const { initiate, select } = api.endpoints[name] as ApiEndpointMutation<
      MutationDefinition<any, any, any, any, any>,
      Definitions
    >;

    return ({ selectFromResult = defaultMutationStateSelector, fixedCacheKey } = {}) => {
      const promiseRef: { current?: MutationActionCreatorResult<any> } = {};
      const requestIdSubject = new BehaviorSubject<string>('');
      const requestId$ = requestIdSubject.asObservable();

      const triggerMutation = (arg: any) => {
        if (!promiseRef.current?.arg.fixedCacheKey) {
          promiseRef.current?.reset();
        }

        const promise = dispatch(initiate(arg, { fixedCacheKey }));
        promiseRef.current = promise;
        requestIdSubject.next(promise.requestId);

        return promise;
      };

      const reset = () => {
        if (promiseRef.current) {
          promiseRef.current = undefined;
        }
        if (fixedCacheKey) {
          dispatch(
            api.internalActions.removeMutationResult({
              requestId: requestIdSubject.value,
              fixedCacheKey,
            }),
          );
        }
      };

      const state$ = requestId$.pipe(
        finalize(() => {
          promiseRef.current?.reset();
          promiseRef.current = undefined;
        }),
        distinctUntilChanged(shallowEqual),
        switchMap((requestId) => {
          const mutationSelector = createSelectorFactory((projector) => resultMemoize(projector, shallowEqual))(
            select(requestId ? { fixedCacheKey, requestId } : skipToken),
            (subState: any) => selectFromResult(subState),
          );
          const currentState = useSelector((state: RootState<Definitions, any, any>) => mutationSelector(state));
          const originalArgs = fixedCacheKey == null ? promiseRef.current?.arg.originalArgs : undefined;
          return currentState.pipe(map((mutationState) => ({ ...mutationState, originalArgs, reset })));
        }),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
      );

      return { dispatch: triggerMutation, state$ } as const;
    };
  }
}
