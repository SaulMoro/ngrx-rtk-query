import {
  type AngularHooksModuleOptions,
  type Dispatch,
  angularHooksModule,
  type angularHooksModuleName,
} from './src/module';

export * from '@reduxjs/toolkit/query';
export { fetchBaseQuery } from './src/fetch-base-query';

export { createApi } from './src/create-api';
export { shallowEqual } from './src/utils';

export type {
  LazyQueryOptions,
  QueryOptions,
  StoreQueryConfig,
  TypedLazyQueryTrigger,
  TypedMutationTrigger,
  TypedUseLazyQuery,
  TypedUseLazyQuerySubscription,
  TypedUseMutation,
  TypedUseMutationResult,
  TypedUseQuery,
  TypedUseQueryHookResult,
  TypedUseQueryState,
  TypedUseQueryStateResult,
  TypedUseQuerySubscription,
  TypedUseQuerySubscriptionResult,
} from './src/types';
export { angularHooksModule, type AngularHooksModuleOptions, type Dispatch, type angularHooksModuleName };
