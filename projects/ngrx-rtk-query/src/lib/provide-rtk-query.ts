import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { StoreRtkQueryModule } from 'ngrx-rtk-query';
import { StoreQueryConfig } from './store-rtk-query.config';

export function provideStoreRtkQuery(config?: Partial<StoreQueryConfig>): EnvironmentProviders {
  return importProvidersFrom(StoreRtkQueryModule.forRoot(config));
}
