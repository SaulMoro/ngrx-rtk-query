/*
 * Public API Surface of dialog
 */
import { angularHooksModule, createApi } from './lib/module';
import { QueryOptions } from './lib/types';

export * from './lib/store-rtk-query.module';
export { createApi, angularHooksModule, QueryOptions };
