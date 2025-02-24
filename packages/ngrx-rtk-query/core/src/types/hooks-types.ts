import { type Signal } from '@angular/core';
import { type ThunkAction, type UnknownAction } from '@reduxjs/toolkit';
import {
  type BaseQueryFn,
  DefinitionType,
  type EndpointDefinition,
  type InfiniteData,
  type InfiniteQueryActionCreatorResult,
  type InfiniteQueryArgFrom,
  type InfiniteQueryDefinition,
  type InfiniteQuerySubState,
  type MutationActionCreatorResult,
  type MutationDefinition,
  type MutationResultSelectorResult,
  type PageParamFrom,
  type PrefetchOptions,
  type QueryActionCreatorResult,
  type QueryArgFrom,
  type QueryDefinition,
  type QueryStatus,
  type QuerySubState,
  type ResultTypeFrom,
  type SkipToken,
  type SubscriptionOptions,
  type TSHelpersId,
  type TSHelpersNoInfer,
  type TSHelpersOverride,
} from '@reduxjs/toolkit/query';

import { type UninitializedValue } from '../constants';
import { type DeepSignal, type SignalsMap } from '../utils';

export type QueryHooks<Definition extends QueryDefinition<any, any, any, any, any>> = {
  useQuery: UseQuery<Definition>;
  useLazyQuery: UseLazyQuery<Definition>;
  useQuerySubscription: UseQuerySubscription<Definition>;
  useLazyQuerySubscription: UseLazyQuerySubscription<Definition>;
  useQueryState: UseQueryState<Definition>;
};

export type InfiniteQueryHooks<Definition extends InfiniteQueryDefinition<any, any, any, any, any>> = {
  useInfiniteQuery: UseInfiniteQuery<Definition>;
  useInfiniteQuerySubscription: UseInfiniteQuerySubscription<Definition>;
  useInfiniteQueryState: UseInfiniteQueryState<Definition>;
};

export type MutationHooks<Definition extends MutationDefinition<any, any, any, any, any>> = {
  useMutation: UseMutation<Definition>;
};

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
  arg: Signal<QueryArgFrom<D> | SkipToken> | (() => QueryArgFrom<D> | SkipToken) | QueryArgFrom<D> | SkipToken,
  options?: UseQueryOptions<D, R> | Signal<UseQueryOptions<D, R>> | (() => UseQueryOptions<D, R>),
) => UseQueryHookResult<D, R>;

export type TypedUseQuery<ResultType, QueryArg, BaseQuery extends BaseQueryFn> = UseQuery<
  QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>
>;

export type UseQueryOptions<
  D extends QueryDefinition<any, any, any, any>,
  R extends Record<string, any> = UseQueryStateDefaultResult<D>,
> = UseQuerySubscriptionOptions & UseQueryStateOptions<D, R>;

export type QueryOptions<
  SelectFromResultType extends Record<string, any> = UseQueryStateDefaultResult<QueryDefinition<any, any, any, any>>,
> = UseQueryOptions<any, SelectFromResultType>;

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

export type UseQuerySubscriptionOptions = SubscriptionOptions & {
  /**
   * Prevents a query from automatically running.
   *
   * @remarks
   * When `skip` is true (or `skipToken` is passed in as `arg`):
   *
   * - **If the query has cached data:**
   *   * The cached data **will not be used** on the initial load, and will ignore updates from
   *      any identical query until the `skip` condition is removed
   *   * The query will have a status of `uninitialized`
   *   * If `skip: false` is set after the initial load, the cached result will be used
   * - **If the query does not have cached data:**
   *   * The query will have a status of `uninitialized`
   *   * The query will not exist in the state when viewed with the dev tools
   *   * The query will not automatically fetch on mount
   *   * The query will not automatically run when additional components with the same query are added that do run
   *
   * @example
   * ```tsx
   * // codeblock-meta no-transpile title="Skip example"
   * const query = useGetPokemonByNameQuery(name, { skip: true });
   * ```
   */
  skip?: boolean;
  /**
   * Defaults to `false`. This setting allows you to control whether if a cached result is already available, RTK Query will only serve a cached result, or if it should `refetch` when set to `true` or if an adequate amount of time has passed since the last successful query result.
   * - `false` - Will not cause a query to be performed _unless_ it does not exist yet.
   * - `true` - Will always refetch when a new subscriber to a query is added. Behaves the same as calling the `refetch` callback or passing `forceRefetch: true` in the action creator.
   * - `number` - **Value is in seconds**. If a number is provided and there is an existing query in the cache, it will
   *    compare the current time vs the last fulfilled timestamp, and only refetch if enough time has elapsed.
   *
   * If you specify this option alongside `skip: true`, this **will not be evaluated** until `skip` is false.
   */
  refetchOnMountOrArgChange?: boolean | number;
};

/**
 * A hook that automatically triggers fetches of data from an endpoint, and 'subscribes' the
 * component to the cached data.
 *
 * The query arg is used as a cache key. Changing the query arg will tell the hook to re-fetch
 * the data if it does not exist in the cache already.
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
  arg: Signal<QueryArgFrom<D> | SkipToken> | (() => QueryArgFrom<D> | SkipToken) | QueryArgFrom<D> | SkipToken,
  options?: UseQuerySubscriptionOptions | Signal<UseQuerySubscriptionOptions> | (() => UseQuerySubscriptionOptions),
) => UseQuerySubscriptionResult<D>;

export type TypedUseQuerySubscription<ResultType, QueryArg, BaseQuery extends BaseQueryFn> = UseQuerySubscription<
  QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>
>;

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

export type LazyQueryTrigger<D extends QueryDefinition<any, any, any, any>> = {
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
   *   const payload = await xxxLazyQuery(1).unwrap();
   *   console.log('fulfilled', payload)
   * } catch (error) {
   *   console.error('rejected', error);
   * }
   * ```
   */
  (arg: QueryArgFrom<D>, extra?: { preferCacheValue?: boolean }): QueryActionCreatorResult<D>;
};

export type TypedLazyQueryTrigger<ResultType, QueryArg, BaseQuery extends BaseQueryFn> = LazyQueryTrigger<
  QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>
>;

export type UseLazyQueryLastPromiseInfo<D extends QueryDefinition<any, any, any, any>> = {
  lastArg: Signal<QueryArgFrom<D>>;
};

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
 *    met and the fetch has been manually called at least once
 *
 * #### Note
 *
 * When the trigger function returned from a LazyQuery is called, it always initiates a new request to the server even
 * if there is cached data. Set `preferCacheValue`(the second argument to the function) as `true` if you want it to
 * immediately return a cached value if one exists.
 */
export type UseLazyQuery<D extends QueryDefinition<any, any, any, any>> = <
  R extends Record<string, any> = UseQueryStateDefaultResult<D>,
>(
  options?: UseLazyQueryOptions<D, R> | Signal<UseLazyQueryOptions<D, R>> | (() => UseLazyQueryOptions<D, R>),
) => LazyQueryTrigger<D> & UseLazyQueryStateResult<D, R> & UseLazyQueryLastPromiseInfo<D>;

export type UseLazyQueryStateResult<
  D extends QueryDefinition<any, any, any, any>,
  R = UseQueryStateDefaultResult<D>,
> = SignalsMap<TSHelpersNoInfer<R>> & {
  /**
   * Resets the hook state to its initial `uninitialized` state.
   * This will also remove the last result from the cache.
   */
  reset: () => void;
};

/**
 * Helper type to manually type the result
 * of the `useLazyQuery` hook in userland code.
 */
export type TypedUseLazyQueryStateResult<
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
  R = UseQueryStateDefaultResult<QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>>,
> = UseLazyQueryStateResult<QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>, R>;

export type TypedUseLazyQuery<ResultType, QueryArg, BaseQuery extends BaseQueryFn> = UseLazyQuery<
  QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>
>;

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
 *    and the fetch has been manually called at least once
 */
export type UseLazyQuerySubscription<D extends QueryDefinition<any, any, any, any>> = (
  options?: SubscriptionOptions | Signal<SubscriptionOptions> | (() => SubscriptionOptions),
) => readonly [LazyQueryTrigger<D>, Signal<QueryArgFrom<D> | UninitializedValue>, { reset: () => void }];

export type TypedUseLazyQuerySubscription<
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
> = UseLazyQuerySubscription<QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>>;

/**
 * @internal
 */
export type QueryStateSelector<R extends Record<string, any>, D extends QueryDefinition<any, any, any, any>> = (
  state: UseQueryStateDefaultResult<D>,
) => R;

export type TypedUseQueryState<ResultType, QueryArg, BaseQuery extends BaseQueryFn> = UseQueryState<
  QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>
>;

/**
 * Provides a way to define a strongly-typed version of
 * {@linkcode QueryStateSelector} for use with a specific query.
 * This is useful for scenarios where you want to create a "pre-typed"
 * {@linkcode UseQueryStateOptions.selectFromResult | selectFromResult}
 * function.
 *
 * @example
 * <caption>#### __Create a strongly-typed `selectFromResult` selector function__</caption>
 *
 * ```tsx
 * import type { TypedQueryStateSelector } from 'ngrx-rtk-query'
 * import { createApi, fetchBaseQuery } from 'ngrx-rtk-query'
 *
 * type Post = {
 *   id: number
 *   title: string
 * }
 *
 * type PostsApiResponse = {
 *   posts: Post[]
 *   total: number
 *   skip: number
 *   limit: number
 * }
 *
 * type QueryArgument = number | undefined
 *
 * type BaseQueryFunction = ReturnType<typeof fetchBaseQuery>
 *
 * type SelectedResult = Pick<PostsApiResponse, 'posts'>
 *
 * const postsApiSlice = createApi({
 *   baseQuery: fetchBaseQuery({ baseUrl: 'https://dummyjson.com/posts' }),
 *   reducerPath: 'postsApi',
 *   tagTypes: ['Posts'],
 *   endpoints: (build) => ({
 *     getPosts: build.query<PostsApiResponse, QueryArgument>({
 *       query: (limit = 5) => `?limit=${limit}&select=title`,
 *     }),
 *   }),
 * })
 *
 * const { useGetPostsQuery } = postsApiSlice
 *
 * ...
 *
 * const typedSelectFromResult: TypedQueryStateSelector<
 *   PostsApiResponse,
 *   QueryArgument,
 *   BaseQueryFunction,
 *   SelectedResult
 * > = (state) => ({ posts: state.data?.posts ?? EMPTY_ARRAY })
 *
 * ...
 *
 * getPostsQuery = useGetPostsQuery(undefined, {
 *     selectFromResult: typedSelectFromResult,
 *   })
 *
 * ...
 * ```
 *
 * @template ResultType - The type of the result `data` returned by the query.
 * @template QueryArgumentType - The type of the argument passed into the query.
 * @template BaseQueryFunctionType - The type of the base query function being used.
 * @template SelectedResultType - The type of the selected result returned by the __`selectFromResult`__ function.
 *
 * @since 18.1.0
 * @public
 */
export type TypedQueryStateSelector<
  ResultType,
  QueryArgumentType,
  BaseQueryFunctionType extends BaseQueryFn,
  SelectedResultType extends Record<string, any> = UseQueryStateDefaultResult<
    QueryDefinition<QueryArgumentType, BaseQueryFunctionType, string, ResultType, string>
  >,
> = QueryStateSelector<
  SelectedResultType,
  QueryDefinition<QueryArgumentType, BaseQueryFunctionType, string, ResultType, string>
>;

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
  arg: Signal<QueryArgFrom<D> | SkipToken> | (() => QueryArgFrom<D> | SkipToken) | QueryArgFrom<D> | SkipToken,
  options?: UseQueryStateOptions<D, R> | Signal<UseQueryStateOptions<D, R>> | (() => UseQueryStateOptions<D, R>),
) => UseQueryStateResult<D, R>;

/**
 * @internal
 */
export type UseQueryStateOptions<D extends QueryDefinition<any, any, any, any>, R extends Record<string, any>> = {
  /**
   * Prevents a query from automatically running.
   *
   * @remarks
   * When skip is true:
   *
   * - **If the query has cached data:**
   *   * The cached data **will not be used** on the initial load, and will ignore updates from
   *    any identical query until the `skip` condition is removed
   *   * The query will have a status of `uninitialized`
   *   * If `skip: false` is set after skipping the initial load, the cached result will be used
   * - **If the query does not have cached data:**
   *   * The query will have a status of `uninitialized`
   *   * The query will not exist in the state when viewed with the dev tools
   *   * The query will not automatically fetch on mount
   *   * The query will not automatically run when additional components with the same query are added that do run
   *
   * @example
   * ```ts
   * // codeblock-meta no-transpile title="Skip example"
   *  const query = useGetPokemonByNameQuery(name, { skip: true });
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
   * post = api.useGetPostsQuery(undefined, {
   *   selectFromResult: ({ data }) => ({ post: data?.find((post) => post.id === id) }),
   * });
   * ```
   */
  selectFromResult?: QueryStateSelector<R, D>;
};

/**
 * Provides a way to define a "pre-typed" version of
 * {@linkcode UseQueryStateOptions} with specific options for a given query.
 * This is particularly useful for setting default query behaviors such as
 * refetching strategies, which can be overridden as needed.
 *
 * @example
 * <caption>#### __Create a `useQuery` hook with default options__</caption>
 *
 * ```ts
 * import type {
 *   SubscriptionOptions,
 *   TypedUseQueryStateOptions,
 * } from 'ngrx-rtk-query'
 * import { createApi, fetchBaseQuery } from 'ngrx-rtk-query'
 *
 * type Post = {
 *   id: number
 *   name: string
 * }
 *
 * const api = createApi({
 *   baseQuery: fetchBaseQuery({ baseUrl: '/' }),
 *   tagTypes: ['Post'],
 *   endpoints: (build) => ({
 *     getPosts: build.query<Post[], void>({
 *       query: () => 'posts',
 *     }),
 *   }),
 * })
 *
 * const { useGetPostsQuery } = api
 *
 * export const useGetPostsQueryWithDefaults = <
 *   SelectedResult extends Record<string, any>,
 * >(
 *   overrideOptions: TypedUseQueryStateOptions<
 *     Post[],
 *     void,
 *     ReturnType<typeof fetchBaseQuery>,
 *     SelectedResult
 *   > &
 *     SubscriptionOptions,
 * ) =>
 *   useGetPostsQuery(undefined, {
 *     // Insert default options here
 *
 *     refetchOnMountOrArgChange: true,
 *     refetchOnFocus: true,
 *     ...overrideOptions,
 *   })
 * ```
 *
 * @template ResultType - The type of the result `data` returned by the query.
 * @template QueryArg - The type of the argument passed into the query.
 * @template BaseQuery - The type of the base query function being used.
 * @template SelectedResult - The type of the selected result returned by the __`selectFromResult`__ function.
 *
 * @since 18.1.0
 * @public
 */
export type TypedUseQueryStateOptions<
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
  SelectedResult extends Record<string, any> = UseQueryStateDefaultResult<
    QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>
  >,
> = UseQueryStateOptions<QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>, SelectedResult>;

export type UseQueryStateResult<_ extends QueryDefinition<any, any, any, any>, R> = DeepSignal<TSHelpersNoInfer<R>>;

/**
 * Helper type to manually type the result
 * of the `useQueryState` hook in userland code.
 */
export type TypedUseQueryStateResult<
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
  R = UseQueryStateDefaultResult<QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>>,
> = DeepSignal<TSHelpersNoInfer<R>>;

type UseQueryStateBaseResult<D extends QueryDefinition<any, any, any, any>> = QuerySubState<D> & {
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

export type UseQueryStateDefaultResult<D extends QueryDefinition<any, any, any, any>> = TSHelpersId<
  | TSHelpersOverride<
      Extract<UseQueryStateBaseResult<D>, { status: QueryStatus.uninitialized }>,
      { isUninitialized: true }
    >
  | TSHelpersOverride<
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
   * @deprecated Included for completeness, but discouraged.
   * Please use the `isLoading`, `isFetching`, `isSuccess`, `isError`
   * and `isUninitialized` flags instead
   */
  status: QueryStatus;
};

export type InfiniteQueryDirection = 'forward' | 'backward';

export type LazyInfiniteQueryTrigger<D extends InfiniteQueryDefinition<any, any, any, any, any>> = {
  /**
   * Triggers a lazy query.
   *
   * By default, this will start a new request even if there is already a value in the cache.
   * If you want to use the cache value and only start a request if there is no cache value, set the second argument to `true`.
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
  (arg: QueryArgFrom<D>, direction: InfiniteQueryDirection): InfiniteQueryActionCreatorResult<D>;
};

export interface UseInfiniteQuerySubscriptionOptions<D extends InfiniteQueryDefinition<any, any, any, any, any>>
  extends SubscriptionOptions {
  /**
   * Prevents a query from automatically running.
   *
   * @remarks
   * When `skip` is true (or `skipToken` is passed in as `arg`):
   *
   * - **If the query has cached data:**
   *   * The cached data **will not be used** on the initial load, and will ignore updates from any identical query until the `skip` condition is removed
   *   * The query will have a status of `uninitialized`
   *   * If `skip: false` is set after the initial load, the cached result will be used
   * - **If the query does not have cached data:**
   *   * The query will have a status of `uninitialized`
   *   * The query will not exist in the state when viewed with the dev tools
   *   * The query will not automatically fetch on mount
   *   * The query will not automatically run when additional components with the same query are added that do run
   *
   * @example
   * ```tsx
   * // codeblock-meta no-transpile title="Skip example"
   *   name = input.required<string>()
   *   skipCall = input(true);
   *
   *   getPokemonByNameQuery = useGetPokemonByNameQuery(name, () => ({
   *     skip: this.skipCall(),
   *   }));
   * };
   * ```
   */
  skip?: boolean;
  /**
   * Defaults to `false`. This setting allows you to control whether if a cached result is already available, RTK Query will only serve a cached result, or if it should `refetch` when set to `true` or if an adequate amount of time has passed since the last successful query result.
   * - `false` - Will not cause a query to be performed _unless_ it does not exist yet.
   * - `true` - Will always refetch when a new subscriber to a query is added. Behaves the same as calling the `refetch` callback or passing `forceRefetch: true` in the action creator.
   * - `number` - **Value is in seconds**. If a number is provided and there is an existing query in the cache, it will compare the current time vs the last fulfilled timestamp, and only refetch if enough time has elapsed.
   *
   * If you specify this option alongside `skip: true`, this **will not be evaluated** until `skip` is false.
   */
  refetchOnMountOrArgChange?: boolean | number;
  initialPageParam?: PageParamFrom<D>;
}

export type TypedUseInfiniteQuerySubscription<
  ResultType,
  QueryArg,
  PageParam,
  BaseQuery extends BaseQueryFn,
> = UseInfiniteQuerySubscription<InfiniteQueryDefinition<QueryArg, PageParam, BaseQuery, string, ResultType, string>>;

export type UseInfiniteQuerySubscriptionResult<D extends InfiniteQueryDefinition<any, any, any, any, any>> = Pick<
  InfiniteQueryActionCreatorResult<D>,
  'refetch'
> & {
  trigger: LazyInfiniteQueryTrigger<D>;
  fetchNextPage: () => InfiniteQueryActionCreatorResult<D>;
  fetchPreviousPage: () => InfiniteQueryActionCreatorResult<D>;
};

/**
 * Helper type to manually type the result
 * of the `useQuerySubscription` hook in userland code.
 */
export type TypedUseInfiniteQuerySubscriptionResult<
  ResultType,
  QueryArg,
  PageParam,
  BaseQuery extends BaseQueryFn,
> = UseInfiniteQuerySubscriptionResult<
  InfiniteQueryDefinition<QueryArg, PageParam, BaseQuery, string, ResultType, string>
>;

export type InfiniteQueryStateSelector<
  R extends Record<string, any>,
  D extends InfiniteQueryDefinition<any, any, any, any, any>,
> = (state: UseInfiniteQueryStateDefaultResult<D>) => R;

/**
 * A hook that automatically triggers fetches of data from an endpoint, 'subscribes' the component to the cached data, and reads the request status and cached data from the Redux store. The component will re-render as the loading status changes and the data becomes available.  Additionally, it will cache multiple "pages" worth of responses within a single cache entry, and allows fetching more pages forwards and backwards from the current cached pages.
 *
 * The query arg is used as a cache key. Changing the query arg will tell the hook to re-fetch the data if it does not exist in the cache already, and the hook will return the data for that query arg once it's available.
 *
 *  The `data` field will be a `{pages: Data[], pageParams: PageParam[]}` structure containing all fetched page responses and the corresponding page param values for each page. You may use this to render individual pages, combine all pages into a single infinite list, or other display logic as needed.
 *
 * This hook combines the functionality of both [`useInfiniteQueryState`](#useinfinitequerystate) and [`useInfiniteQuerySubscription`](#useinfinitequerysubscription) together, and is intended to be used in the majority of situations.
 *
 * As with normal query hooks, `skipToken` is a valid argument that will skip the query from executing.
 *
 * By default, the initial request will use the `initialPageParam` value that was defined on the infinite query endpoint. If you want to start from a different value, you can pass `initialPageParam` as part of the hook options to override that initial request value.
 *
 * Use the returned `fetchNextPage` and `fetchPreviousPage` methods on the hook result object to trigger fetches forwards and backwards. These will always calculate the next or previous page param based on the current cached pages and the provided `getNext/PreviousPageParam` callbacks defined in the endpoint.
 *
 *
 * #### Features
 *
 * - Automatically triggers requests to retrieve data based on the hook argument and whether cached data exists by default
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Caches multiple pages worth of responses, and provides methods to trigger more page fetches forwards and backwards
 * - Accepts polling/re-fetching options to trigger automatic re-fetches when the corresponding criteria is met
 * - Returns the latest request status and cached data from the Redux store
 * - Re-renders as the request status changes and data becomes available
 */
export type UseInfiniteQuery<D extends InfiniteQueryDefinition<any, any, any, any, any>> = <
  R extends Record<string, any> = UseInfiniteQueryStateDefaultResult<D>,
>(
  arg:
    | Signal<InfiniteQueryArgFrom<D> | SkipToken>
    | (() => InfiniteQueryArgFrom<D> | SkipToken)
    | InfiniteQueryArgFrom<D>
    | SkipToken,
  options?:
    | (UseInfiniteQuerySubscriptionOptions<D> & UseInfiniteQueryStateOptions<D, R>)
    | Signal<UseInfiniteQuerySubscriptionOptions<D> & UseInfiniteQueryStateOptions<D, R>>
    | (() => UseInfiniteQuerySubscriptionOptions<D> & UseInfiniteQueryStateOptions<D, R>),
) => UseInfiniteQueryHookResult<D, R> &
  Pick<UseInfiniteQuerySubscriptionResult<D>, 'fetchNextPage' | 'fetchPreviousPage'>;

/**
 * A hook that reads the request status and cached data from the Redux store. The component will re-render as the loading status changes and the data becomes available.
 *
 * Note that this hook does not trigger fetching new data. For that use-case, see [`useInfiniteQuery`](#useinfinitequery) or [`useInfiniteQuerySubscription`](#useinfinitequerysubscription).
 *
 * #### Features
 *
 * - Returns the latest request status and cached data from the Redux store
 * - Re-renders as the request status changes and data becomes available
 */
export type UseInfiniteQueryState<D extends InfiniteQueryDefinition<any, any, any, any, any>> = <
  R extends Record<string, any> = UseInfiniteQueryStateDefaultResult<D>,
>(
  arg: Signal<QueryArgFrom<D> | SkipToken> | (() => QueryArgFrom<D> | SkipToken) | QueryArgFrom<D> | SkipToken,
  options?:
    | UseInfiniteQueryStateOptions<D, R>
    | Signal<UseInfiniteQueryStateOptions<D, R>>
    | (() => UseInfiniteQueryStateOptions<D, R>),
) => UseInfiniteQueryStateResult<D, R>;

export type TypedUseInfiniteQueryState<
  ResultType,
  QueryArg,
  PageParam,
  BaseQuery extends BaseQueryFn,
> = UseInfiniteQueryState<InfiniteQueryDefinition<QueryArg, PageParam, BaseQuery, string, ResultType, string>>;

/**
 * A hook that automatically triggers fetches of data from an endpoint, and 'subscribes' the component to the cached data. Additionally, it will cache multiple "pages" worth of responses within a single cache entry, and allows fetching more pages forwards and backwards from the current cached pages.
 *
 * The query arg is used as a cache key. Changing the query arg will tell the hook to re-fetch the data if it does not exist in the cache already.
 *
 * Note that this hook does not return a request status or cached data. For that use-case, see [`useInfiniteQuery`](#useinfinitequery) or [`useInfiniteQueryState`](#useinfinitequerystate).
 *
 * #### Features
 *
 * - Automatically triggers requests to retrieve data based on the hook argument and whether cached data exists by default
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Caches multiple pages worth of responses, and provides methods to trigger more page fetches forwards and backwards
 * - Accepts polling/re-fetching options to trigger automatic re-fetches when the corresponding criteria is met
 */
export type UseInfiniteQuerySubscription<D extends InfiniteQueryDefinition<any, any, any, any, any>> = (
  arg: Signal<QueryArgFrom<D> | SkipToken> | (() => QueryArgFrom<D> | SkipToken) | QueryArgFrom<D> | SkipToken,
  options?:
    | UseInfiniteQuerySubscriptionOptions<D>
    | Signal<UseInfiniteQuerySubscriptionOptions<D>>
    | (() => UseInfiniteQuerySubscriptionOptions<D>),
) => UseInfiniteQuerySubscriptionResult<D>;

export type UseInfiniteQueryHookResult<
  D extends InfiniteQueryDefinition<any, any, any, any, any>,
  R = UseInfiniteQueryStateDefaultResult<D>,
> = UseInfiniteQueryStateResult<D, R> & Pick<UseInfiniteQuerySubscriptionResult<D>, 'refetch'>;

export type UseInfiniteQueryStateOptions<
  D extends InfiniteQueryDefinition<any, any, any, any, any>,
  R extends Record<string, any>,
> = {
  /**
   * Prevents a query from automatically running.
   *
   * @remarks
   * When skip is true:
   *
   * - **If the query has cached data:**
   *   * The cached data **will not be used** on the initial load, and will ignore updates from any identical query until the `skip` condition is removed
   *   * The query will have a status of `uninitialized`
   *   * If `skip: false` is set after skipping the initial load, the cached result will be used
   * - **If the query does not have cached data:**
   *   * The query will have a status of `uninitialized`
   *   * The query will not exist in the state when viewed with the dev tools
   *   * The query will not automatically fetch on mount
   *   * The query will not automatically run when additional components with the same query are added that do run
   *
   * @example
   * ```ts
   * // codeblock-meta title="Skip example"
   *   name = input.required<string>()
   *   skipCall = input(true);
   *
   *   getPokemonByNameQuery = useGetPokemonByNameQuery(name, () => ({
   *     skip: this.skipCall(),
   *   }));
   * ```
   */
  skip?: boolean;
  /**
   * `selectFromResult` allows you to get a specific segment from a query result in a performant manner.
   * When using this feature, the component will not rerender unless the underlying data of the selected item has changed.
   * If the selected item is one element in a larger collection, it will disregard changes to elements in the same collection.
   *
   * @example
   * ```ts
   * // codeblock-meta title="Using selectFromResult to extract a single result"
   * post = api.useGetPostsQuery(undefined, {
   *   selectFromResult: ({ data }) => ({ post: data?.find((post) => post.id === id) }),
   * });
   * ```
   */
  selectFromResult?: InfiniteQueryStateSelector<R, D>;
};

export type UseInfiniteQueryStateResult<_ extends InfiniteQueryDefinition<any, any, any, any, any>, R> = DeepSignal<
  TSHelpersNoInfer<R>
>;

export type UseInfiniteQueryStateBaseResult<D extends InfiniteQueryDefinition<any, any, any, any, any>> =
  InfiniteQuerySubState<D> & {
    /**
     * Where `data` tries to hold data as much as possible, also re-using
     * data from the last arguments passed into the hook, this property
     * will always contain the received data from the query, for the current query arguments.
     */
    currentData?: InfiniteData<ResultTypeFrom<D>, PageParamFrom<D>>;
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
    hasNextPage: false;
    hasPreviousPage: false;
    isFetchingNextPage: false;
    isFetchingPreviousPage: false;
  };

export type UseInfiniteQueryStateDefaultResult<D extends InfiniteQueryDefinition<any, any, any, any, any>> =
  TSHelpersId<
    | TSHelpersOverride<
        Extract<UseInfiniteQueryStateBaseResult<D>, { status: QueryStatus.uninitialized }>,
        { isUninitialized: true }
      >
    | TSHelpersOverride<
        UseInfiniteQueryStateBaseResult<D>,
        | { isLoading: true; isFetching: boolean; data: undefined }
        | ({
            isSuccess: true;
            isFetching: true;
            error: undefined;
          } & Required<Pick<UseInfiniteQueryStateBaseResult<D>, 'data' | 'fulfilledTimeStamp'>>)
        | ({
            isSuccess: true;
            isFetching: false;
            error: undefined;
          } & Required<Pick<UseInfiniteQueryStateBaseResult<D>, 'data' | 'fulfilledTimeStamp' | 'currentData'>>)
        | ({ isError: true } & Required<Pick<UseInfiniteQueryStateBaseResult<D>, 'error'>>)
      >
  > & {
    /**
     * @deprecated Included for completeness, but discouraged.
     * Please use the `isLoading`, `isFetching`, `isSuccess`, `isError`
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

export type UseMutationStateResult<D extends MutationDefinition<any, any, any, any>, R> = SignalsMap<
  TSHelpersNoInfer<R>
> & {
  originalArgs: Signal<QueryArgFrom<D> | undefined>;
  /**
   * Resets the hook state to its initial `uninitialized` state.
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
 * to read the request status from the Redux store. The component will re-render as the loading status changes.
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
) => MutationTrigger<D> & UseMutationStateResult<D, R>;

export type TypedUseMutation<ResultType, QueryArg, BaseQuery extends BaseQueryFn> = UseMutation<
  MutationDefinition<QueryArg, BaseQuery, string, ResultType, string>
>;

export type MutationTrigger<D extends MutationDefinition<any, any, any, any>> = {
  /**
   * Triggers the mutation and returns a Promise.
   * @remarks
   * If you need to access the error or success payload immediately after a mutation, you can chain .unwrap().
   *
   * @example
   * ```ts
   * // codeblock-meta title="Using .unwrap with async await"
   * try {
   *   const payload = await this.addPostMutation({ id: 1, name: 'Example' }).unwrap();
   *   console.log('fulfilled', payload)
   * } catch (error) {
   *   console.error('rejected', error);
   * }
   * ```
   *
   * @example
   * ```ts
   * // codeblock-meta title="Using .unwrap with async await"
   * this.deletePostMutation(+this.route.snapshot.params.id)
   *    .unwrap()
   *    .then(() => this.router.navigate(['/posts']))
   *    .catch(() => console.error('Error deleting Post'));
   * ```
   */
  (arg: QueryArgFrom<D>): MutationActionCreatorResult<D>;
};

export type TypedMutationTrigger<ResultType, QueryArg, BaseQuery extends BaseQueryFn> = MutationTrigger<
  MutationDefinition<QueryArg, BaseQuery, string, ResultType, string>
>;

export type GenericPrefetchThunk = (
  endpointName: any,
  arg: any,
  options: PrefetchOptions,
) => ThunkAction<void, any, any, UnknownAction>;

export function isQueryDefinition(e: EndpointDefinition<any, any, any, any>): e is QueryDefinition<any, any, any, any> {
  return e.type === DefinitionType.query;
}

export function isMutationDefinition(
  e: EndpointDefinition<any, any, any, any>,
): e is MutationDefinition<any, any, any, any> {
  return e.type === DefinitionType.mutation;
}

export function isInfiniteQueryDefinition(
  e: EndpointDefinition<any, any, any, any>,
): e is InfiniteQueryDefinition<any, any, any, any, any> {
  return e.type === DefinitionType.infinitequery;
}

export type Subscribers = { [requestId: string]: SubscriptionOptions };

export type SubscriptionState = {
  [queryCacheKey: string]: Subscribers | undefined;
};

export interface SubscriptionSelectors {
  getSubscriptions: () => SubscriptionState;
  getSubscriptionCount: (queryCacheKey: string) => number;
  isRequestSubscribed: (queryCacheKey: string, requestId: string) => boolean;
}
