import { NgModule } from '@angular/core';
import { ActionReducerMap, StoreModule } from '@ngrx/store';
import { routerReducer, RouterReducerState, RouterState, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRtkQueryModule } from 'ngrx-rtk-query';

import { environment } from '@environments/environment';
import { counterApi } from '@app/core/services';

export type RootState = {
  router: RouterReducerState;
  [counterApi.reducerPath]: ReturnType<typeof counterApi.reducer>;
  // Rest of Queries are lazy / code splitted
};

export const reducers: ActionReducerMap<RootState> = {
  router: routerReducer,
  [counterApi.reducerPath]: counterApi.reducer,
  // Rest of Queries are lazy / code splitted
};

@NgModule({
  imports: [
    StoreModule.forRoot(reducers, { metaReducers: [counterApi.metareducer] }),
    StoreRouterConnectingModule.forRoot({ routerState: RouterState.Minimal }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    StoreRtkQueryModule.forRoot({ setupListeners: true }),
  ],
})
export class CoreStoreModule {}
