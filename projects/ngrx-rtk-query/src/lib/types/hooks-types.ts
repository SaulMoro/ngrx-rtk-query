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

export interface QueryHooks<Definition extends QueryDefinition<any, any, any, any, any>> {
  useQuery: UseQuery<Definition>;
  useQuerySubscription: UseQuerySubscription<Definition>;
  useQueryState: UseQueryState<Definition>;
}

export interface MutationHooks<Definition extends MutationDefinition<any, any, any, any, any>> {
  useMutation: MutationHook<Definition>;
}

export type UseQuery<D extends QueryDefinition<any, any, any, any>> = <R = UseQueryStateDefaultResult<D>>(
  arg: QueryArgFrom<D> | Observable<QueryArgFrom<D>>,
  options?: UseQueryOptions<D, R> | Observable<UseQueryOptions<D, R>>
) => Observable<UseQueryStateResult<D, R> & ReturnType<UseQuerySubscription<D>>>;

export type UseQueryOptions<
  D extends QueryDefinition<any, any, any, any>,
  R = UseQueryStateDefaultResult<D>
> = UseQuerySubscriptionOptions & UseQueryStateOptions<D, R>;

export type QueryOptions<SelectFromResultType = UseQueryStateDefaultResult<any>> = UseQueryOptions<
  any,
  SelectFromResultType
>;

export interface UseQuerySubscriptionOptions extends SubscriptionOptions {
  skip?: boolean | Observable<boolean>;
  refetchOnMountOrArgChange?: boolean | number;
}

export type UseQuerySubscription<D extends QueryDefinition<any, any, any, any>> = (
  arg: QueryArgFrom<D>,
  options?: UseQuerySubscriptionOptions,
  promiseRef?: { current?: QueryActionCreatorResult<D> }
) => Pick<QueryActionCreatorResult<D>, 'refetch'>;

export type QueryStateSelector<R, D extends QueryDefinition<any, any, any, any>> = (
  state: QueryResultSelectorResult<D>,
  lastResult: R | undefined,
  defaultQueryStateSelector: DefaultQueryStateSelector<D>
) => R;

export type DefaultQueryStateSelector<D extends QueryDefinition<any, any, any, any>> = (
  state: QueryResultSelectorResult<D>,
  lastResult: Pick<UseQueryStateDefaultResult<D>, 'data'>
) => UseQueryStateDefaultResult<D>;

export type UseQueryState<D extends QueryDefinition<any, any, any, any>> = <R = UseQueryStateDefaultResult<D>>(
  arg: QueryArgFrom<D>,
  options?: UseQueryStateOptions<D, R>,
  lastValue?: { current?: UseQueryStateResult<D, R> }
) => Observable<UseQueryStateResult<D, R>>;

export type UseQueryStateOptions<D extends QueryDefinition<any, any, any, any>, R> = {
  skip?: boolean | Observable<boolean>;
  selectFromResult?: QueryStateSelector<R, D>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  state: Observable<MutationSubState<D> & RequestStatusFlags>;
};

export type GenericPrefetchThunk = (
  endpointName: any,
  arg: any,
  options: PrefetchOptions
) => ThunkAction<void, any, any, AnyAction>;

export function isQueryDefinition(e: EndpointDefinition<any, any, any, any>): e is QueryDefinition<any, any, any, any> {
  return e.type === 'query';
}

export function isMutationDefinition(
  e: EndpointDefinition<any, any, any, any>
): e is MutationDefinition<any, any, any, any> {
  return e.type === 'mutation';
}
