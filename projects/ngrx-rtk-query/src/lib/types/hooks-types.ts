import { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import { MutationDefinition, QueryDefinition, EndpointDefinition } from '@rtk-incubator/rtk-query';
import {
  MutationSubState,
  QueryStatus,
  QuerySubState,
  RequestStatusFlags,
  SubscriptionOptions,
} from '@rtk-incubator/rtk-query/dist/esm/ts/core/apiState';
import { QueryActionCreatorResult } from '@rtk-incubator/rtk-query/dist/esm/ts/core/buildInitiate';
import { QueryResultSelectorResult } from '@rtk-incubator/rtk-query/dist/esm/ts/core/buildSelectors';
import { PrefetchOptions } from '@rtk-incubator/rtk-query/dist/esm/ts/core/module';
import { QueryArgFrom, ResultTypeFrom } from '@rtk-incubator/rtk-query/dist/esm/ts/endpointDefinitions';
import { Id, NoInfer, Override } from '@rtk-incubator/rtk-query/dist/esm/ts/tsHelpers';
import { Observable } from 'rxjs';
import { UninitializedValue } from '../constants';

export interface QueryHooks<Definition extends QueryDefinition<any, any, any, any, any>> {
  useQuery: UseQuery<Definition>;
  useLazyQuery: UseLazyQuery<Definition>;
  useQuerySubscription: UseQuerySubscription<Definition>;
  useLazyQuerySubscription: UseLazyQuerySubscription<Definition>;
  useQueryState: UseQueryState<Definition>;
}

export interface MutationHooks<Definition extends MutationDefinition<any, any, any, any, any>> {
  useMutation: MutationHook<Definition>;
}

export type UseQuery<D extends QueryDefinition<any, any, any, any>> = <R = UseQueryStateDefaultResult<D>>(
  arg: QueryArgFrom<D> | Observable<QueryArgFrom<D>>,
  options?: UseQueryOptions<D, R> | Observable<UseQueryOptions<D, R>>,
) => Observable<UseQueryStateResult<D, R> & ReturnType<UseQuerySubscription<D>>>;

export interface UseQuerySubscriptionOptions extends SubscriptionOptions {
  skip?: boolean;
  refetchOnMountOrArgChange?: boolean | number;
}

export type UseQueryOptions<
  D extends QueryDefinition<any, any, any, any>,
  R = UseQueryStateDefaultResult<D>
> = UseQuerySubscriptionOptions & UseQueryStateOptions<D, R>;

export type QueryOptions<
  SelectFromResultType = UseQueryStateDefaultResult<QueryDefinition<any, any, any, any>>
> = UseQueryOptions<any, SelectFromResultType>;

export type UseQuerySubscription<D extends QueryDefinition<any, any, any, any>> = (
  arg: QueryArgFrom<D>,
  options?: UseQuerySubscriptionOptions,
  promiseRef?: { current?: QueryActionCreatorResult<D> },
) => Pick<QueryActionCreatorResult<D>, 'refetch'>;

export type UseLazyTrigger<D extends QueryDefinition<any, any, any, any>> = (
  arg: QueryArgFrom<D>,
  extra?: { preferCacheValue?: boolean },
) => void;

export type UseLazyQueryLastPromiseInfo<D extends QueryDefinition<any, any, any, any>> = {
  lastArg: QueryArgFrom<D> | UninitializedValue;
  extra?: Parameters<UseLazyTrigger<D>>[1];
};

export type UseLazyQuery<D extends QueryDefinition<any, any, any, any>> = <R = UseQueryStateDefaultResult<D>>(
  options?: UseLazyQueryOptions<D, R> | Observable<UseLazyQueryOptions<D, R>>,
) => {
  fetch: UseLazyTrigger<D>;
  state$: Observable<UseQueryStateResult<D, R>>;
  info$: Observable<UseLazyQueryLastPromiseInfo<D>>;
};

export type UseLazyQueryOptions<
  D extends QueryDefinition<any, any, any, any>,
  R = UseQueryStateDefaultResult<D>
> = SubscriptionOptions & Omit<UseQueryStateOptions<D, R>, 'skip'>;

export type LazyQueryOptions<
  SelectFromResultType = UseQueryStateDefaultResult<QueryDefinition<any, any, any, any>>
> = UseLazyQueryOptions<any, SelectFromResultType>;

export type UseLazyQuerySubscription<D extends QueryDefinition<any, any, any, any>> = (
  options?: SubscriptionOptions,
  promiseRef?: { current?: QueryActionCreatorResult<any> },
) => [UseLazyTrigger<D>, QueryArgFrom<D> | UninitializedValue];

export type QueryStateSelector<R, D extends QueryDefinition<any, any, any, any>> = (
  state: QueryResultSelectorResult<D>,
  lastResult: R | undefined,
  defaultQueryStateSelector: DefaultQueryStateSelector<D>,
) => R;

export type DefaultQueryStateSelector<D extends QueryDefinition<any, any, any, any>> = (
  state: QueryResultSelectorResult<D>,
  lastResult: Pick<UseQueryStateDefaultResult<D>, 'data'>,
) => UseQueryStateDefaultResult<D>;

export type UseQueryState<D extends QueryDefinition<any, any, any, any>> = <R = UseQueryStateDefaultResult<D>>(
  arg: QueryArgFrom<D>,
  options?: UseQueryStateOptions<D, R>,
  lastValue?: { current?: any },
) => Observable<UseQueryStateResult<D, R>>;

export type UseQueryStateOptions<D extends QueryDefinition<any, any, any, any>, R> = {
  skip?: boolean;
  selectFromResult?: QueryStateSelector<R, D>;
};

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
export type UseQueryStateResult<_ extends QueryDefinition<any, any, any, any>, R> = NoInfer<R>;

export type UseQueryStateBaseResult<D extends QueryDefinition<any, any, any, any>> = QuerySubState<D> & {
  /**
   * Query has not started yet.
   */
  isUninitialized: false;
  /**
   * Query is currently loading for the first time. No data yet.
   */
  isLoading: false;
  /**
   * Query is currently fetching, but might have data from an earlier request.
   */
  isFetching: false;
  /**
   * Query has data from a successful load.
   */
  isSuccess: false;
  /**
   * Query is currently in "error" state.
   */
  isError: false;
};

export type UseQueryStateDefaultResult<D extends QueryDefinition<any, any, any, any>> = Id<
  | Override<Extract<UseQueryStateBaseResult<D>, { status: QueryStatus.uninitialized }>, { isUninitialized: true }>
  | Override<
      UseQueryStateBaseResult<D>,
      | { isLoading: true; isFetching: boolean; data: undefined }
      | ({ isSuccess: true; isFetching: boolean; error: undefined } & Required<
          Pick<UseQueryStateBaseResult<D>, 'data' | 'fulfilledTimeStamp'>
        >)
      | ({ isError: true } & Required<Pick<UseQueryStateBaseResult<D>, 'error'>>)
    >
> & {
  /**
   * @deprecated will be removed in the next version
   * please use the `isLoading`, `isFetching`, `isSuccess`, `isError`
   * and `isUninitialized` flags instead
   */
  status: QueryStatus;
};

export type MutationHook<D extends MutationDefinition<any, any, any, any>> = () => {
  dispatch: (arg: QueryArgFrom<D>) => { unwrap: () => Promise<ResultTypeFrom<D>> };
  state$: Observable<MutationSubState<D> & RequestStatusFlags>;
};

export type GenericPrefetchThunk = (
  endpointName: any,
  arg: any,
  options: PrefetchOptions,
) => ThunkAction<void, any, any, AnyAction>;

export function isQueryDefinition(e: EndpointDefinition<any, any, any, any>): e is QueryDefinition<any, any, any, any> {
  return e.type === 'query';
}

export function isMutationDefinition(
  e: EndpointDefinition<any, any, any, any>,
): e is MutationDefinition<any, any, any, any> {
  return e.type === 'mutation';
}
