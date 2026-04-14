import { type Signal } from '@angular/core';
import {
  type ApiEndpointInfiniteQuery,
  type ApiEndpointMutation,
  type ApiEndpointQuery,
  type InfiniteQueryArgFrom,
  type InfiniteQueryDefinition,
  type InfiniteQueryResultSelectorResult,
  type MutationDefinition,
  type MutationResultSelectorResult,
  type QueryArgFrom,
  type QueryDefinition,
  type QueryResultSelectorResult,
  type SkipToken,
} from '@reduxjs/toolkit/query';

import { type SelectSignalOptions } from 'ngrx-rtk-query/core';

export type MutationSelectorArg = {
  fixedCacheKey: string;
};

type QueryStateMethod<Definition extends QueryDefinition<any, any, any, any, any>> =
  QueryArgFrom<Definition> extends void
    ? (
        arg?: QueryArgFrom<Definition> | SkipToken,
        options?: SelectSignalOptions<QueryResultSelectorResult<Definition>>,
      ) => Signal<QueryResultSelectorResult<Definition>>
    : (
        arg: QueryArgFrom<Definition> | SkipToken,
        options?: SelectSignalOptions<QueryResultSelectorResult<Definition>>,
      ) => Signal<QueryResultSelectorResult<Definition>>;

type InfiniteQueryStateMethod<Definition extends InfiniteQueryDefinition<any, any, any, any, any>> =
  InfiniteQueryArgFrom<Definition> extends void
    ? (
        arg?: InfiniteQueryArgFrom<Definition> | SkipToken,
        options?: SelectSignalOptions<InfiniteQueryResultSelectorResult<Definition>>,
      ) => Signal<InfiniteQueryResultSelectorResult<Definition>>
    : (
        arg: InfiniteQueryArgFrom<Definition> | SkipToken,
        options?: SelectSignalOptions<InfiniteQueryResultSelectorResult<Definition>>,
      ) => Signal<InfiniteQueryResultSelectorResult<Definition>>;

type MutationStateMethod<Definition extends MutationDefinition<any, any, any, any, any>> = (
  arg: MutationSelectorArg,
  options?: SelectSignalOptions<MutationResultSelectorResult<Definition>>,
) => Signal<MutationResultSelectorResult<Definition>>;

export type GeneratedStateMethod = (arg?: unknown, options?: SelectSignalOptions<unknown>) => Signal<unknown>;

type EndpointStateMethodFromEndpoint<Endpoint> =
  Endpoint extends ApiEndpointQuery<infer Definition, any>
    ? QueryStateMethod<Definition>
    : Endpoint extends ApiEndpointInfiniteQuery<infer Definition, any>
      ? InfiniteQueryStateMethod<Definition>
      : Endpoint extends ApiEndpointMutation<infer Definition, any>
        ? MutationStateMethod<Definition>
        : never;

export type EndpointStateMethodsFromApi<TApi> = TApi extends {
  endpoints: infer Endpoints extends Record<string, object>;
}
  ? {
      [K in keyof Endpoints as EndpointStateMethodFromEndpoint<Endpoints[K]> extends never
        ? never
        : `${K & string}State`]: EndpointStateMethodFromEndpoint<Endpoints[K]>;
    }
  : never;
