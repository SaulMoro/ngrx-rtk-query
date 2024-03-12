import {
  ENVIRONMENT_INITIALIZER,
  Injector,
  inject,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';
import { provideState } from '@ngrx/store';
import { setupListeners as setupListenersFn, type Api } from '@reduxjs/toolkit/query';

export interface StoreQueryConfig {
  setupListeners?: Parameters<typeof setupListenersFn>[1] | false;
}

export function provideStoreApi(
  api: Api<any, Record<string, any>, string, string, any>,
  { setupListeners }: StoreQueryConfig = {},
): EnvironmentProviders {
  setupListeners === false ? undefined : setupListenersFn(api.dispatch, setupListeners);

  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue() {
        const injector = inject(Injector);
        Object.assign(api, { injector });
      },
    },
    provideState(api.reducerPath, api.reducer),
  ]);
}
