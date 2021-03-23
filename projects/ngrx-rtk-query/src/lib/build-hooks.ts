import { Api, EndpointDefinitions, MutationDefinition, QueryDefinition } from '@rtk-incubator/rtk-query';
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
import { BehaviorSubject, of, isObservable, merge } from 'rxjs';
import {
  concatMap,
  distinctUntilChanged,
  finalize,
  map,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { AngularHooksModuleOptions } from './module';
import {
  DefaultQueryStateSelector,
  GenericPrefetchThunk,
  MutationHook,
  QueryHooks,
  QueryStateSelector,
  UseQuery,
  UseQueryOptions,
  UseQueryState,
  UseQueryStateDefaultResult,
  UseQuerySubscription,
} from './types';
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

  return {
    ...currentState,
    data,
    isFetching,
    isLoading,
    isSuccess,
  } as UseQueryStateDefaultResult<any>;
};

export function buildHooks<Definitions extends EndpointDefinitions>({
  api,
  moduleOptions: { useDispatch: dispatch, useSelector },
}: {
  api: Api<any, Definitions, any, string, CoreModule>;
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
      if (!skip) {
        const lastPromise = promiseRef?.current;
        if (lastPromise && lastPromise.arg === arg) {
          // arg did not change, but options did probably, update them
          lastPromise.updateSubscriptionOptions({
            pollingInterval,
            refetchOnReconnect,
            refetchOnFocus,
          });
        } else {
          if (lastPromise) {
            lastPromise.unsubscribe();
          }
          const promise = dispatch(
            initiate(arg, {
              subscriptionOptions: { pollingInterval, refetchOnReconnect, refetchOnFocus },
              forceRefetch: refetchOnMountOrArgChange,
            }),
          );
          promiseRef.current = promise;
        }
      }

      return { refetch: () => void promiseRef.current?.refetch() };
    };

    const useQueryState: UseQueryState<any> = (
      arg: any,
      { skip = false, selectFromResult = defaultQueryStateSelector as QueryStateSelector<any, any> } = {},
      lastValue = {},
    ) => {
      const querySelector: MemoizedSelectorWithProps<any, any, any> = createSelectorFactory((projector) =>
        resultMemoize(projector, shallowEqual),
      )(
        [select(skip ? 'skip selector' : arg), (_: any, lastResult: any) => lastResult],
        (subState: any, lastResult: any) => selectFromResult(subState, lastResult, defaultQueryStateSelector),
      );

      return useSelector((state: RootState<Definitions, any, any>) => querySelector(state, lastValue.current)).pipe(
        tap((value) => (lastValue.current = value)),
      );
    };

    const useQuery: UseQuery<any> = (arg, options) => {
      // Refs
      const promiseRef: { current?: QueryActionCreatorResult<any> } = {};
      const lastValue: { current?: any } = {};

      const arg$ = isObservable(arg) ? arg : of(arg);
      const options$ = isObservable(options) ? options : of(options);
      return merge(
        arg$.pipe(
          concatMap((currentArg) => of(currentArg).pipe(withLatestFrom(options$))),
          map(([currentArg, currentOptions]) => ({ currentArg, currentOptions })),
        ),
        options$.pipe(
          concatMap((currentOptions) => of(currentOptions).pipe(withLatestFrom(arg$))),
          map(([currentOptions, currentArg]) => ({ currentArg, currentOptions })),
        ),
      ).pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        switchMap(({ currentArg, currentOptions }: { currentArg: any; currentOptions?: UseQueryOptions<any, any> }) => {
          const querySubscriptionResults = useQuerySubscription(currentArg, currentOptions, promiseRef);
          const queryStateResults = useQueryState(currentArg, currentOptions, lastValue);
          return queryStateResults.pipe(map((queryState) => ({ ...queryState, ...querySubscriptionResults })));
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

    return {
      useQuerySubscription,
      useQueryState,
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

      const triggerMutation = (args: any) => {
        if (promiseRef.current) {
          promiseRef.current.unsubscribe();
        }

        const promise = dispatch(initiate(args));
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
