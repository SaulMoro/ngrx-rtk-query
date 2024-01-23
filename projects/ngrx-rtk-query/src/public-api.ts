import { angularHooksModule, angularHooksModuleName } from './lib/module';

export * from '@reduxjs/toolkit/query';
export { fetchBaseQuery } from './lib/fetch-base-query';
export { provideStoreApi } from './lib/provide-rtk-query';

export { createApi } from './lib/create-api';

export {
  LazyQueryOptions,
  QueryOptions,
  TypedUseMutationResult,
  TypedUseQueryHookResult,
  TypedUseQueryStateResult,
  TypedUseQuerySubscriptionResult,
} from './lib/types';
export { angularHooksModule, angularHooksModuleName };
