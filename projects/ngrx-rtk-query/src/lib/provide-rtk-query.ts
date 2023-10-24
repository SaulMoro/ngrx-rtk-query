import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import { Api, setupListeners } from '@reduxjs/toolkit/query';
import { STORE_RTK_QUERY_CONFIG, StoreQueryConfig, defaultConfig, setupConfig } from './store-rtk-query.config';
import { ThunkService, dispatch } from './thunk.service';

export function provideStoreRtkQuery(config?: Partial<StoreQueryConfig>): EnvironmentProviders {
  const moduleConfig = { ...defaultConfig, ...config };

  setupConfig(moduleConfig);

  if (moduleConfig.setupListeners) {
    setupListeners(dispatch, moduleConfig.setupListeners === true ? undefined : moduleConfig.setupListeners);
  }

  return makeEnvironmentProviders([
    { provide: STORE_RTK_QUERY_CONFIG, useValue: moduleConfig },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue() {
        inject(ThunkService).init();
      },
    },
  ]);
}

export function provideStoreApi(api: Api<any, Record<string, any>, string, string, any>): EnvironmentProviders {
  return provideState(api.reducerPath, api.reducer, { metaReducers: [api.metareducer] });
}
