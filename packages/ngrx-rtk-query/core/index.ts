import {
  type AngularHooksModuleOptions,
  type Dispatch,
  angularHooksModule,
  type angularHooksModuleName,
} from './src/module';

export * from '@reduxjs/toolkit/query';
export { fetchBaseQuery } from './src/fetch-base-query';

export { UNINITIALIZED_VALUE } from './src/constants';
export { createApi } from './src/create-api';
export { shallowEqual } from './src/utils';

export type {
  LazyQueryOptions,
  QueryOptions,
  SelectSignalOptions,
  StoreQueryConfig,
  TypedLazyQueryTrigger,
  TypedMutationTrigger,
  TypedQueryStateSelector,
  TypedUseInfiniteQueryState,
  TypedUseInfiniteQuerySubscription,
  TypedUseInfiniteQuerySubscriptionResult,
  TypedUseLazyQuery,
  TypedUseLazyQueryStateResult,
  TypedUseLazyQuerySubscription,
  TypedUseMutation,
  TypedUseMutationResult,
  TypedUseQuery,
  TypedUseQueryHookResult,
  TypedUseQueryState,
  TypedUseQueryStateOptions,
  TypedUseQueryStateResult,
  TypedUseQuerySubscription,
  TypedUseQuerySubscriptionResult,
} from './src/types';
export { angularHooksModule, type AngularHooksModuleOptions, type Dispatch, type angularHooksModuleName };
