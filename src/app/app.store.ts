import { NgModule } from '@angular/core';
import { ActionReducerMap, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRtkQueryModule } from 'ngrx-rtk-query';
import { environment } from '@environments/environment';

// eslint-disable-next-line @typescript-eslint/ban-types
export type RootState = {};

export const reducers: ActionReducerMap<RootState> = {};

@NgModule({
  imports: [
    StoreModule.forRoot(reducers, {
      metaReducers: [],
    }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    StoreRtkQueryModule.forRoot({ setupListeners: true }),
  ],
})
export class AppStoreModule {}
