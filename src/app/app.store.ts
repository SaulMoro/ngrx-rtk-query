import { NgModule } from '@angular/core';
import { ActionReducerMap, StoreModule } from '@ngrx/store';
import { RouterState, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRtkQueryModule } from 'ngrx-rtk-query';

import { environment } from '@environments/environment';
import { counterApi, postApi } from '@app/core/services';

export type RootState = {
  [counterApi.reducerPath]: ReturnType<typeof counterApi.reducer>;
  [postApi.reducerPath]: ReturnType<typeof postApi.reducer>;
};

export const reducers: ActionReducerMap<RootState> = {
  [counterApi.reducerPath]: counterApi.reducer,
  [postApi.reducerPath]: postApi.reducer,
};

@NgModule({
  imports: [
    StoreModule.forRoot(reducers, {
      metaReducers: [counterApi.metareducer, postApi.metareducer],
    }),
    StoreRouterConnectingModule.forRoot({ routerState: RouterState.Minimal }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    StoreRtkQueryModule.forRoot({ setupListeners: true }),
  ],
})
export class AppStoreModule {}
