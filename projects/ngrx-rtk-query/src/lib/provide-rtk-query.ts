import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { provideState } from '@ngrx/store';

import { StoreQueryConfig } from './store-rtk-query.config';
import { StoreRtkQueryModule } from './store-rtk-query.module';

export function provideStoreRtkQuery(config?: Partial<StoreQueryConfig>): EnvironmentProviders {
  return importProvidersFrom(StoreRtkQueryModule.forRoot(config));
}

export function provideStoreApi(api: any): EnvironmentProviders {
  return provideState(api.reducerPath, api.reducer, { metaReducers: [api.metareducer] });
}
