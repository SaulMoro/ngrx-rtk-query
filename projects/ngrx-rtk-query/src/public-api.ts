/*
 * Public API Surface of dialog
 */

import { buildCreateApi, coreModule } from '@rtk-incubator/rtk-query';
import { angularHooksModule } from './lib/module';
import { QueryOptions } from './lib/types/hooks-types';

const createApi = buildCreateApi(coreModule(), angularHooksModule());

export * from './lib/store-rtk-query.module';
export { createApi, angularHooksModule, QueryOptions };
