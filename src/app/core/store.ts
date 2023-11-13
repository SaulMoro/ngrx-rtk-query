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
import { provideStoreRtkQuery } from 'ngrx-rtk-query';

import { counterApi } from '@app/core/services';

export type RootState = {
  [DEFAULT_ROUTER_FEATURENAME]: RouterReducerState;
  [counterApi.reducerPath]: ReturnType<typeof counterApi.reducer>;
  //
  // Rest of Queries are lazy / code splitted
};

export const reducers: ActionReducerMap<RootState> = {
  [DEFAULT_ROUTER_FEATURENAME]: routerReducer,
  [counterApi.reducerPath]: counterApi.reducer,
  // Rest of Queries are lazy / code splitted
};

export function provideCoreStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideStore(reducers, { metaReducers: [counterApi.metareducer] }),
    provideRouterStore({ routerState: RouterState.Minimal }),
    provideStoreDevtools({ logOnly: !isDevMode(), name: 'BMED Agenda App' }),
    provideStoreRtkQuery({ setupListeners: true }),
  ]);
}
