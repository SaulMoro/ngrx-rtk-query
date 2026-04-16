export * from '@reduxjs/toolkit/query';
export { fetchBaseQuery } from './src/fetch-base-query';
export { setupRuntimeListeners } from './src/setup-runtime-listeners';

export { UNINITIALIZED_VALUE } from './src/constants';
export { createApi } from './src/create-api';
export { shallowEqual } from './src/utils';
export type { DeepSignal, Signal, SignalsMap } from './src/utils';

export type * from './src/types';
export {
  angularHooksModule,
  angularHooksModuleName,
  type AngularHooksModule,
  type AngularHooksModuleOptions,
  type Dispatch,
} from './src/module';
