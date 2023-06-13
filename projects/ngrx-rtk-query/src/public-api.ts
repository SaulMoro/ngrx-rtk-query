import { coreModule, buildCreateApi, CreateApi } from '@reduxjs/toolkit/query';
import { angularHooksModule, angularHooksModuleName } from './lib/module';

import type { MutationHooks, QueryHooks } from './lib/types';
import type {
  EndpointDefinitions,
  QueryDefinition,
  MutationDefinition,
  QueryArgFrom,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import type { BaseQueryFn } from '@reduxjs/toolkit/dist/query/baseQueryTypes';

import type { QueryKeys } from '@reduxjs/toolkit/dist/query/core/apiState';
import type { PrefetchOptions } from '@reduxjs/toolkit/dist/query/core/module';

export * from '@reduxjs/toolkit/query';
export * from './lib/provide-rtk-query';
export { fetchBaseQuery } from './lib/fetch-base-query';
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
export { createApi, angularHooksModule };
