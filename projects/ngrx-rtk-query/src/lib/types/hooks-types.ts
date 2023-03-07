import { MemoizedSelector } from '@ngrx/store';
import type { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import type { QueryStatus, QuerySubState, SubscriptionOptions } from '@reduxjs/toolkit/dist/query/core/apiState';
import type {
  MutationActionCreatorResult,
  QueryActionCreatorResult,
} from '@reduxjs/toolkit/dist/query/core/buildInitiate';
import type {
  MutationResultSelectorResult,
  QueryResultSelectorResult,
} from '@reduxjs/toolkit/dist/query/core/buildSelectors';
import type { PrefetchOptions } from '@reduxjs/toolkit/dist/query/core/module';
import type { EndpointDefinition, QueryArgFrom, ResultTypeFrom } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import type { Id, NoInfer, Override } from '@reduxjs/toolkit/dist/query/tsHelpers';
import type { BaseQueryFn, MutationDefinition, QueryDefinition, SkipToken } from '@reduxjs/toolkit/query';
import { Observable } from 'rxjs';
import type { UninitializedValue } from '../constants';

export interface QueryHooks<Definition extends QueryDefinition<any, any, any, any, any>> {
  useQuery: UseQuery<Definition>;
  useLazyQuery: UseLazyQuery<Definition>;
  useQuerySubscription: UseQuerySubscription<Definition>;
  useLazyQuerySubscription: UseLazyQuerySubscription<Definition>;
  useQueryState: UseQueryState<Definition>;
  selector: QuerySelector<Definition>;
}

export interface MutationHooks<Definition extends MutationDefinition<any, any, any, any, any>> {
  useMutation: UseMutation<Definition>;
  selector: MutationSelector<Definition>;
}

export type QuerySelector<Definition extends QueryDefinition<any, any, any, any>> = (
  queryArg: QueryArgFrom<Definition> | SkipToken,
) => MemoizedSelector<Record<string, any>, QueryResultSelectorResult<Definition>>;
export type MutationSelector<Definition extends MutationDefinition<any, any, any, any>> = (
  requestId: string | { requestId: string | undefined; fixedCacheKey: string | undefined } | SkipToken,
) => MemoizedSelector<Record<string, any>, MutationResultSelectorResult<Definition>>;

/**
 * A hook that automatically triggers fetches of data from an endpoint, 'subscribes' the component
 * to the cached data, and reads the request status and cached data from the Redux store. The component
 * will re-render as the loading status changes and the data becomes available.
 *
 * The query arg is used as a cache key. Changing the query arg will tell the hook to re-fetch the data if
 * it does not exist in the cache already, and the hook will return the data for that query arg once it's available.
 *
 * This hook combines the functionality of both [`useQueryState`](#usequerystate) and
 * [`useQuerySubscription`](#usequerysubscription) together, and is intended to be used in the majority of situations.
 *
 * #### Features
 *
 * - Automatically triggers requests to retrieve data based on the hook argument and whether cached data
 * exists by default
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Accepts polling/re-fetching options to trigger automatic re-fetches when the corresponding criteria is met
 * - Returns the latest request status and cached data from the Redux store
 * - Re-renders as the request status changes and data becomes available
 */
export type UseQuery<D extends QueryDefinition<any, any, any, any>> = <
  R extends Record<string, any> = UseQueryStateDefaultResult<D>,
>(
  arg: QueryArgFrom<D> | Observable<QueryArgFrom<D> | UninitializedValue> | SkipToken,
  options?: UseQueryOptions<D, R> | Observable<UseQueryOptions<D, R>>,
) => Observable<UseQueryHookResult<D, R>>;

export type UseQueryHookResult<
  D extends QueryDefinition<any, any, any, any>,
  R = UseQueryStateDefaultResult<D>,
> = UseQueryStateResult<D, R> & UseQuerySubscriptionResult<D>;

/**
 * Helper type to manually type the result
 * of the `useQuery` hook in userland code.
 */
export type TypedUseQueryHookResult<
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
  R = UseQueryStateDefaultResult<QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>>,
> = TypedUseQueryStateResult<ResultType, QueryArg, BaseQuery, R> &
  TypedUseQuerySubscriptionResult<ResultType, QueryArg, BaseQuery>;

export interface UseQuerySubscriptionOptions extends SubscriptionOptions {
  /**
   * Prevents a query from automatically running.
   *
   * @remarks
   * When `skip` is true (or `skipToken` is passed in as `arg`):
   *
   * - **If the query has cached data:**
   *   * The cached data **will not be used** on the initial load, and will ignore updates from
   * any identical query until the `skip` condition is removed
   *   * The query will have a status of `uninitialized`
   *   * If `skip: false` is set after the initial load, the cached result will be used
   * - **If the query does not have cached data:**
   *   * The query will have a status of `uninitialized`
   *   * The query will not exist in the state when viewed with the dev tools
   *   * The query will not automatically fetch on mount
   *   * The query will not automatically run when additional components with the same query are added that do run
   *
   * @example
   * ```ts
   * // codeblock-meta title="Skip example"
   * const query$ = useGetPokemonByNameQuery(name, { skip: true });
   * ```
   */
  skip?: boolean;
  /**
   * Defaults to `false`. This setting allows you to control whether if a cached result is already available, RTK Query will only serve a cached result, or if it should `refetch` when set to `true` or if an adequate amount of time has passed since the last successful query result.
   * - `false` - Will not cause a query to be performed _unless_ it does not exist yet.
   * - `true` - Will always refetch when a new subscriber to a query is added. Behaves the same as calling the `refetch` callback or passing `forceRefetch: true` in the action creator.
   * - `number` - **Value is in seconds**. If a number is provided and there is an existing query in the cache, it will
   * compare the current time vs the last fulfilled timestamp, and only refetch if enough time has elapsed.
   *
   * If you specify this option alongside `skip: true`, this **will not be evaluated** until `skip` is false.
   */
  refetchOnMountOrArgChange?: boolean | number;
}

export type UseQueryOptions<
  D extends QueryDefinition<any, any, any, any>,
  R extends Record<string, any> = UseQueryStateDefaultResult<D>,
> = UseQuerySubscriptionOptions & UseQueryStateOptions<D, R>;

export type QueryOptions<
  SelectFromResultType extends Record<string, any> = UseQueryStateDefaultResult<QueryDefinition<any, any, any, any>>,
> = UseQueryOptions<any, SelectFromResultType>;

/**
 * A hook that automatically triggers fetches of data from an endpoint, and 'subscribes' the
 * component to the cached data.
 *
 * The query arg is used as a cache key. Changing the query arg will tell the hook to re-fetch the
 * data if it does not exist in the cache already.
 *
 * Note that this hook does not return a request status or cached data. For that use-case,
 * see [`useQuery`](#usequery) or [`useQueryState`](#usequerystate).
 *
 * #### Features
 *
 * - Automatically triggers requests to retrieve data based on the hook argument and whether
 * cached data exists by default
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Accepts polling/re-fetching options to trigger automatic re-fetches when the corresponding criteria is met
 */
export type UseQuerySubscription<D extends QueryDefinition<any, any, any, any>> = (
  arg: QueryArgFrom<D> | SkipToken | UninitializedValue,
  options?: UseQuerySubscriptionOptions,
  promiseRef?: { current?: QueryActionCreatorResult<D> },
  argCacheRef?: { current?: any },
  lastRenderHadSubscription?: { current?: boolean },
) => UseQuerySubscriptionResult<D>;

export type UseQuerySubscriptionResult<D extends QueryDefinition<any, any, any, any>> = Pick<
  QueryActionCreatorResult<D>,
  'refetch'
>;

/**
 * Helper type to manually type the result
 * of the `useQuerySubscription` hook in userland code.
 */
export type TypedUseQuerySubscriptionResult<
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
> = UseQuerySubscriptionResult<QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>>;

export type UseLazyTrigger<D extends QueryDefinition<any, any, any, any>> = (
  arg: QueryArgFrom<D>,
  extra?: { preferCacheValue?: boolean },
) => QueryActionCreatorResult<D>;

export type UseLazyQueryLastPromiseInfo<D extends QueryDefinition<any, any, any, any>> = {
  lastArg: QueryArgFrom<D> | UninitializedValue;
  extra?: Parameters<UseLazyTrigger<D>>[1];
};

/**
 * Helper type to manually type the result
 * of the `useQueryState` hook in userland code.
 */
export type TypedUseQueryStateResult<
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
  R = UseQueryStateDefaultResult<QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>>,
> = NoInfer<R>;

/**
 * A hook similar to [`useQuery`](#usequery), but with manual control over when the data fetching occurs.
 *
 * This hook includes the functionality of [`useLazyQuerySubscription`](#uselazyquerysubscription).
 *
 * #### Features
 *
 * - Manual control over firing a request to retrieve data
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Returns the latest request status and cached data from the Redux store
 * - Re-renders as the request status changes and data becomes available
 * - Accepts polling/re-fetching options to trigger automatic re-fetches when the corresponding criteria is
 * met and the fetch has been manually called at least once
 *
 * #### Note
 *
 * When the trigger function returned from a LazyQuery is called, it always initiates a new request to the server even
 * if there is cached data. Set `preferCacheValue`(the second argument to the function) as true if you want it to
 * immediately return a cached value if one exists.
 */
export type UseLazyQuery<D extends QueryDefinition<any, any, any, any>> = <
  R extends Record<string, any> = UseQueryStateDefaultResult<D>,
>(
  options?: UseLazyQueryOptions<D, R> | Observable<UseLazyQueryOptions<D, R>>,
) => {
  /**
   * Triggers a lazy query.
   *
   * By default, this will start a new request even if there is already a value in the cache.
   * If you want to use the cache value and only start a request if there is no cache value,
   * set the second argument to `true`.
   *
   * @remarks
   * If you need to access the error or success payload immediately after a lazy query, you can chain .unwrap().
   *
   * @example
   * ```ts
   * // codeblock-meta title="Using .unwrap with async await"
   * try {
   *   const payload = await getUserById(1).unwrap();
   *   console.log('fulfilled', payload)
   * } catch (error) {
   *   console.error('rejected', error);
   * }
   * ```
   */
  fetch: UseLazyTrigger<D>;
  state$: Observable<UseQueryStateResult<D, R>>;
  lastArg$: Observable<QueryArgFrom<D> | UninitializedValue>;
};

export type UseLazyQueryOptions<
  D extends QueryDefinition<any, any, any, any>,
  R extends Record<string, any> = UseQueryStateDefaultResult<D>,
> = SubscriptionOptions & Omit<UseQueryStateOptions<D, R>, 'skip'>;

export type LazyQueryOptions<
  SelectFromResultType extends Record<string, any> = UseQueryStateDefaultResult<QueryDefinition<any, any, any, any>>,
> = UseLazyQueryOptions<any, SelectFromResultType>;

/**
 * A hook similar to [`useQuerySubscription`](#usequerysubscription), but with manual control over when
 * the data fetching occurs.
 *
 * Note that this hook does not return a request status or cached data. For that use-case,
 * see [`useLazyQuery`](#uselazyquery).
 *
 * #### Features
 *
 * - Manual control over firing a request to retrieve data
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Accepts polling/re-fetching options to trigger automatic re-fetches when the corresponding criteria is met
 * and the fetch has been manually called at least once
 */
export type UseLazyQuerySubscription<D extends QueryDefinition<any, any, any, any>> = (
  options?: SubscriptionOptions,
  promiseRef?: { current?: QueryActionCreatorResult<any> },
) => readonly [UseLazyTrigger<D>, QueryArgFrom<D> | UninitializedValue];

export type QueryStateSelector<R extends Record<string, any>, D extends QueryDefinition<any, any, any, any>> = (
  state: UseQueryStateDefaultResult<D>,
) => R;

/**
 * A hook that reads the request status and cached data from the Redux store. The component will re-render
 * as the loading status changes and the data becomes available.
 *
 * Note that this hook does not trigger fetching new data. For that use-case,
 * see [`useQuery`](#usequery) or [`useQuerySubscription`](#usequerysubscription).
 *
 * #### Features
 *
 * - Returns the latest request status and cached data from the Redux store
 * - Re-renders as the request status changes and data becomes available
 */
export type UseQueryState<D extends QueryDefinition<any, any, any, any>> = <
  R extends Record<string, any> = UseQueryStateDefaultResult<D>,
>(
  arg: QueryArgFrom<D> | Observable<QueryArgFrom<D> | UninitializedValue> | SkipToken,
  options?: UseQueryStateOptions<D, R>,
  lastValue?: { current?: any },
  argCacheRef?: { current?: any },
) => Observable<UseQueryStateResult<D, R>>;

export type UseQueryStateOptions<D extends QueryDefinition<any, any, any, any>, R extends Record<string, any>> = {
  /**
   * Prevents a query from automatically running.
   *
   * @remarks
   * When skip is true:
   *
   * - **If the query has cached data:**
   *   * The cached data **will not be used** on the initial load, and will ignore updates from
   * any identical query until the `skip` condition is removed
   *   * The query will have a status of `uninitialized`
   *   * If `skip: false` is set after the initial load, the cached result will be used
   * - **If the query does not have cached data:**
   *   * The query will have a status of `uninitialized`
   *   * The query will not exist in the state when viewed with the dev tools
   *   * The query will not automatically fetch on mount
   *   * The query will not automatically run when additional components with the same query are added that do run
   *
   * @example
   * ```ts
   * // codeblock-meta title="Skip example"
   * const query$ = useGetPokemonByNameQuery(name, { skip: true });
   * ```
   */
  skip?: boolean;
  /**
   * `selectFromResult` allows you to get a specific segment from a query result in a performant manner.
   * When using this feature, the component will not rerender unless the underlying data of the selected
   * item has changed.
   * If the selected item is one element in a larger collection, it will disregard changes to elements in
   * the same collection.
   *
   * @example
   * ```ts
   * // codeblock-meta title="Using selectFromResult to extract a single result"
   * const query$ = api.useGetPostsQuery(undefined, {
   *   selectFromResult: ({ data }) => ({ post: data?.find((post) => post.id === id) }),
   * });
   * ```
   */
  selectFromResult?: QueryStateSelector<R, D>;
};

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
export type UseQueryStateResult<_ extends QueryDefinition<any, any, any, any>, R> = NoInfer<R>;

export type UseQueryStateBaseResult<D extends QueryDefinition<any, any, any, any>> = QuerySubState<D> & {
  /**
   * Where `data` tries to hold data as much as possible, also re-using
   * data from the last arguments passed into the hook, this property
   * will always contain the received data from the query, for the current query arguments.
   */
  currentData?: ResultTypeFrom<D>;
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
      | ({
          isSuccess: true;
          isFetching: true;
          error: undefined;
        } & Required<Pick<UseQueryStateBaseResult<D>, 'data' | 'fulfilledTimeStamp'>>)
      | ({
          isSuccess: true;
          isFetching: false;
          error: undefined;
        } & Required<Pick<UseQueryStateBaseResult<D>, 'data' | 'fulfilledTimeStamp' | 'currentData'>>)
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

export type MutationStateSelector<R extends Record<string, any>, D extends MutationDefinition<any, any, any, any>> = (
  state: MutationResultSelectorResult<D>,
) => R;

export type UseMutationStateOptions<D extends MutationDefinition<any, any, any, any>, R extends Record<string, any>> = {
  selectFromResult?: MutationStateSelector<R, D>;
  fixedCacheKey?: string;
};

export type UseMutationStateResult<D extends MutationDefinition<any, any, any, any>, R> = NoInfer<R> & {
  originalArgs?: QueryArgFrom<D>;
  /**
   * Resets the hook state to it's initial `uninitialized` state.
   * This will also remove the last result from the cache.
   */
  reset: () => void;
};

/**
 * Helper type to manually type the result
 * of the `useMutation` hook in userland code.
 */
export type TypedUseMutationResult<
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
  R = MutationResultSelectorResult<MutationDefinition<QueryArg, BaseQuery, string, ResultType, string>>,
> = UseMutationStateResult<MutationDefinition<QueryArg, BaseQuery, string, ResultType, string>, R>;

/**
 * A hook that lets you trigger an update request for a given endpoint, and subscribes the component
 *  to read the request status from the Redux store. The component will re-render as the loading status changes.
 *
 * #### Features
 *
 * - Manual control over firing a request to alter data on the server or possibly invalidate the cache
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Returns the latest request status and cached data from the Redux store
 * - Re-renders as the request status changes and data becomes available
 */
export type UseMutation<D extends MutationDefinition<any, any, any, any>> = <
  R extends Record<string, any> = MutationResultSelectorResult<D>,
>(
  options?: UseMutationStateOptions<D, R>,
) => {
  /**
   * Triggers the mutation and returns a Promise.
   *
   * @remarks
   * If you need to access the error or success payload immediately after a mutation, you can chain .unwrap().
   *
   * @example
   * ```ts
   * // codeblock-meta title="Using .unwrap with async await"
   * try {
   *   const payload = await this.addPost.dispatch(({ id: 1, name: 'Example' })).unwrap();
   *   console.log('fulfilled', payload)
   * } catch (error) {
   *   console.error('rejected', error);
   * }
   * ```
   *
   * @example
   * ```ts
   * // codeblock-meta title="Using .unwrap with async await"
   * this.deletePostMutation
   *    .dispatch(+this.route.snapshot.params.id)
   *    .unwrap()
   *    .then(() => this.router.navigate(['/posts']))
   *    .catch(() => console.error('Error deleting Post'));
   * ```
   */
  dispatch: MutationTrigger<D>;
  state$: Observable<UseMutationStateResult<D, R>>;
};

export type MutationTrigger<D extends MutationDefinition<any, any, any, any>> = (
  arg: QueryArgFrom<D>,
) => MutationActionCreatorResult<D>;

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
