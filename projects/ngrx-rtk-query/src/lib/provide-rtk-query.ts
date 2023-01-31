import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { provideState } from '@ngrx/store';
import { CoreModule } from '@reduxjs/toolkit/dist/query/core/module';
import { Api } from '@reduxjs/toolkit/query';
import { StoreRtkQueryModule } from 'ngrx-rtk-query';

import { AngularHooksModule } from './module';
import { StoreQueryConfig } from './store-rtk-query.config';

export function provideStoreRtkQuery(config?: Partial<StoreQueryConfig>): EnvironmentProviders {
  return importProvidersFrom(StoreRtkQueryModule.forRoot(config));
}

export function provideApi(
  api: Api<any, Record<string, any>, string, string, AngularHooksModule | CoreModule>,
): EnvironmentProviders {
  return provideState(api.reducerPath, api.reducer, { metaReducers: [api.metareducer] });
}
