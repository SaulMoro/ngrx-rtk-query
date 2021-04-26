import { InjectionToken } from '@angular/core';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { onFocus, onFocusLost, onOnline, onOffline } from '@reduxjs/toolkit/dist/query/core/setupListeners';

export interface StoreQueryConfig {
  setupListeners: boolean;
  customHandler?: (
    dispatch: ThunkDispatch<any, any, any>,
    actions: {
      onFocus: typeof onFocus;
      onFocusLost: typeof onFocusLost;
      onOnline: typeof onOnline;
      onOffline: typeof onOffline;
    },
  ) => () => void;
}

export const defaultConfig: StoreQueryConfig = {
  setupListeners: false,
};

export const STORE_RTK_QUERY_CONFIG = new InjectionToken<StoreQueryConfig>('STORE_RTK_QUERY_CONFIG');
