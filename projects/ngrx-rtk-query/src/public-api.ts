import { buildCreateApi, coreModule } from '@reduxjs/toolkit/query';
import { angularHooksModule, angularHooksModuleName } from './lib/module';

export * from '@reduxjs/toolkit/query';
export { fetchBaseQuery } from './lib/fetch-base-query';
export { provideStoreApi, provideStoreRtkQuery } from './lib/provide-rtk-query';
export { ThunkService, dispatch } from './lib/thunk.service';

const createApi = /* @__PURE__ */ buildCreateApi(coreModule(), angularHooksModule());

export {
  LazyQueryOptions,
  QueryOptions,
  TypedUseMutationResult,
  TypedUseQueryHookResult,
  TypedUseQueryStateResult,
  TypedUseQuerySubscriptionResult,
} from './lib/types';
export { angularHooksModule, angularHooksModuleName, createApi };
