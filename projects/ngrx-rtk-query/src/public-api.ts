/*
 * Public API Surface of ngrx-rtk-query
 */
export * from './lib/store-rtk-query.module';
export { createApi, angularHooksModule } from './lib/module';
export { ThunkService, dispatch } from './lib/thunk.service';

export { QueryOptions, LazyQueryOptions } from './lib/types';
