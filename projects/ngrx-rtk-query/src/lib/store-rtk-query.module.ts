import { ModuleWithProviders, NgModule } from '@angular/core';
import { setupListeners } from '@reduxjs/toolkit/query';
import { defaultConfig, StoreQueryConfig, STORE_RTK_QUERY_CONFIG } from './store-rtk-query.config';
import { dispatch, ThunkService } from './thunk.service';

@NgModule({})
export class StoreRtkQueryModule {
  static forRoot(config?: Partial<StoreQueryConfig>): ModuleWithProviders<StoreRtkQueryModule> {
    const moduleConfig = { ...defaultConfig, ...config };

    if (moduleConfig.setupListeners) {
      setupListeners(dispatch, moduleConfig.customHandler);
    }

    return {
      ngModule: StoreRtkQueryModule,
      providers: [{ provide: STORE_RTK_QUERY_CONFIG, useValue: moduleConfig }, ThunkService],
    };
  }

  constructor(private thunkService: ThunkService) {}
}
