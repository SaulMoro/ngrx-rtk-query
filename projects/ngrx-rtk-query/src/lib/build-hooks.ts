import { Api, EndpointDefinitions, MutationDefinition, QueryDefinition, QueryStatus } from '@rtk-incubator/rtk-query';
import { QueryKeys, RootState } from '@rtk-incubator/rtk-query/dist/esm/ts/core/apiState';
import {
  MutationActionCreatorResult,
  QueryActionCreatorResult,
} from '@rtk-incubator/rtk-query/dist/esm/ts/core/buildInitiate';
import {
  ApiEndpointMutation,
  ApiEndpointQuery,
  CoreModule,
  PrefetchOptions,
} from '@rtk-incubator/rtk-query/dist/esm/ts/core/module';
import { createSelectorFactory, MemoizedSelectorWithProps, resultMemoize } from '@ngrx/store';
import { BehaviorSubject, of, isObservable, combineLatest } from 'rxjs';
import { distinctUntilChanged, finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { AngularHooksModuleOptions } from './module';
import {
  DefaultQueryStateSelector,
  GenericPrefetchThunk,
  MutationHook,
  QueryHooks,
  QueryStateSelector,
  UseLazyQuery,
  UseLazyQueryLastPromiseInfo,
  UseLazyQuerySubscription,
  UseLazyTrigger,
  UseQuery,
  UseQueryState,
  UseQueryStateDefaultResult,
  UseQuerySubscription,
} from './types';
import { UNINITIALIZED_VALUE } from './constants';
import { shallowEqual } from './utils';

const defaultQueryStateSelector: DefaultQueryStateSelector<any> = (currentState, lastResult) => {
  // data is the last known good request result we have tracked
  // or if none has been tracked yet the last good result for the current args
  const data = (currentState.isSuccess ? currentState.data : lastResult?.data) ?? currentState.data;

  // isFetching = true any time a request is in flight
  const isFetching = currentState.isLoading;
  // isLoading = true only when loading while no data is present yet (initial load with no data in the cache)
  const isLoading = !data && isFetching;
  // isSuccess = true when data is present
  const isSuccess = currentState.isSuccess || (isFetching && !!data);

  return { ...currentState, data, isFetching, isLoading, isSuccess } as UseQueryStateDefaultResult<any>;
};

/**
 * Wrapper around `defaultQueryStateSelector` to be used in `useQuery`.
 * We want the initial render to already come back with
 * `{ isUninitialized: false, isFetching: true, isLoading: true }`
 * to prevent that the library user has to do an additional check for `isUninitialized`/
 */
const noPendingQueryStateSelector: DefaultQueryStateSelector<any> = (currentState, lastResult) => {
  const selected = defaultQueryStateSelector(currentState, lastResult);
  if (selected.isUninitialized) {
    return {
      ...selected,
      isUninitialized: false,
      isFetching: true,
      isLoading: true,
      status: QueryStatus.pending,
    };
  }
  return selected;
};

export function buildHooks<Definitions extends EndpointDefinitions>({
  api,
  moduleOptions: { useDispatch: dispatch, useSelector },
}: {
  api: Api<any, Definitions, any, any, CoreModule>;
  moduleOptions: Required<AngularHooksModuleOptions>;
}) {
  return { buildQueryHooks, buildMutationHook, usePrefetch };

  function usePrefetch<EndpointName extends QueryKeys<Definitions>>(
    endpointName: EndpointName,
    defaultOptions?: PrefetchOptions,
  ) {
    return (arg: any, options?: PrefetchOptions) =>
      dispatch(
        (api.util.prefetchThunk as GenericPrefetchThunk)(endpointName, arg, {
          ...defaultOptions,
          ...options,
        }),
      );
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
    ) => {
      if (!skip && arg !== UNINITIALIZED_VALUE) {
        const subscriptionOptions = { refetchOnReconnect, refetchOnFocus, pollingInterval };
        const lastPromise = promiseRef?.current;
        const lastSubscriptionOptions = promiseRef.current?.subscriptionOptions;

        if (!lastPromise || !shallowEqual(lastPromise.arg, arg)) {
          lastPromise?.unsubscribe();
          promiseRef.current = dispatch(
            initiate(arg, { subscriptionOptions, forceRefetch: refetchOnMountOrArgChange }),
          );
        } else if (!shallowEqual(subscriptionOptions, lastSubscriptionOptions)) {
          lastPromise.updateSubscriptionOptions(subscriptionOptions);
        }
      }

      return { refetch: () => void promiseRef.current?.refetch() };
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

      return [trigger, argState];
    };

    const useQueryState: UseQueryState<any> = (
      arg: any,
      { skip = false, selectFromResult = defaultQueryStateSelector as QueryStateSelector<any, any> } = {},
      lastValue = {},
    ) => {
      const arg$ = isObservable(arg) ? arg : of(arg);
      return arg$.pipe(
        distinctUntilChanged(shallowEqual),
        switchMap((currentArg) => {
          const querySelector: MemoizedSelectorWithProps<any, any, any> = createSelectorFactory((projector) =>
            resultMemoize(projector, shallowEqual),
          )(
            [
              select(skip || currentArg === UNINITIALIZED_VALUE ? 'skip selector' : currentArg),
              (_: any, lastResult: any) => lastResult,
            ],
            (subState: any, lastResult: any) => selectFromResult(subState, lastResult, defaultQueryStateSelector),
          );

          return useSelector((state: RootState<Definitions, any, any>) => querySelector(state, lastValue.current)).pipe(
            tap((value) => (lastValue.current = value)),
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

      const arg$ = isObservable(arg) ? arg : of(arg);
      const options$ = isObservable(options) ? options : of(options);

      return combineLatest([
        arg$.pipe(distinctUntilChanged(shallowEqual)),
        options$.pipe(distinctUntilChanged((prev, curr) => shallowEqual(prev, curr))),
      ]).pipe(
        switchMap(([currentArg, currentOptions]) => {
          const querySubscriptionResults = useQuerySubscription(currentArg, currentOptions, promiseRef);
          const queryStateResults$ = useQueryState(
            currentArg,
            {
              selectFromResult: currentOptions?.skip
                ? undefined
                : (noPendingQueryStateSelector as QueryStateSelector<any, any>),
              ...currentOptions,
            },
            lastValue,
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
        switchMap(([currentOptions, currentArg]) => useQueryState(currentArg, currentOptions, lastValue)),
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

  function buildMutationHook(name: string): MutationHook<any> {
    const { initiate, select } = api.endpoints[name] as ApiEndpointMutation<
      MutationDefinition<any, any, any, any, any>,
      Definitions
    >;

    return () => {
      const promiseRef: { current?: MutationActionCreatorResult<any> } = {};
      const requestIdSubject = new BehaviorSubject<string>('');
      const requestId$ = requestIdSubject.asObservable();

      const triggerMutation = (arg: any) => {
        promiseRef.current?.unsubscribe();

        const promise = dispatch(initiate(arg));
        promiseRef.current = promise;
        requestIdSubject.next(promise.requestId);

        return promise;
      };

      const state$ = requestId$.pipe(
        finalize(() => {
          promiseRef.current?.unsubscribe();
          promiseRef.current = undefined;
        }),
        switchMap((requestId) => useSelector(select(requestId))),
      );

      return { dispatch: triggerMutation, state$ };
    };
  }
}
