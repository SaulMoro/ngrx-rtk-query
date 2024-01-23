import { EnvironmentProviders, isDevMode, makeEnvironmentProviders } from '@angular/core';
import {
  DEFAULT_ROUTER_FEATURENAME,
  RouterReducerState,
  RouterState,
  provideRouterStore,
  routerReducer,
} from '@ngrx/router-store';
import { ActionReducerMap, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideStoreApi } from 'ngrx-rtk-query';

import { counterApi } from '@app/core/services';

export type RootState = {
  [DEFAULT_ROUTER_FEATURENAME]: RouterReducerState;
};

export const reducers: ActionReducerMap<RootState> = {
  [DEFAULT_ROUTER_FEATURENAME]: routerReducer,
};

export function provideCoreStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideStore(reducers),
    provideRouterStore({ routerState: RouterState.Minimal }),
    provideStoreDevtools({ logOnly: !isDevMode(), name: 'BMED Agenda App' }),
    provideStoreApi(counterApi),
  ]);
}
