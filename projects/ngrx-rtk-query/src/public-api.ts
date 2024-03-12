import { angularHooksModule, angularHooksModuleName } from './lib/module';

export * from '@reduxjs/toolkit/query';
export { fetchBaseQuery } from './lib/fetch-base-query';
export { provideStoreApi } from './lib/provide-store-api';

export { createApi } from './lib/create-api';

export {
  LazyQueryOptions,
  QueryOptions,
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
} from './lib/types';
export { angularHooksModule, angularHooksModuleName };
