/*
 * Public API Surface of ngrx-rtk-query
 */
export { fetchBaseQuery } from './lib/fetch-base-query';
export { angularHooksModule, createApi } from './lib/module';
export * from './lib/provide-rtk-query';
export { ThunkService, dispatch } from './lib/thunk.service';
export {
  LazyQueryOptions,
  QueryOptions,
  TypedUseMutationResult,
  TypedUseQueryHookResult,
  TypedUseQueryStateResult,
  TypedUseQuerySubscriptionResult,
} from './lib/types';
