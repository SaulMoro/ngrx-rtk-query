import { InjectionToken } from '@angular/core';
import type { ThunkDispatch } from '@reduxjs/toolkit';
import { onFocus, onFocusLost, onOnline, onOffline } from '@reduxjs/toolkit/dist/query/core/setupListeners';

export interface StoreQueryConfig {
  setupListeners: boolean;
  baseUrl: string;
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

export let currentConfig: StoreQueryConfig | undefined;
export const setupConfig = (config: StoreQueryConfig) => {
  currentConfig = config;
};

export const defaultConfig: StoreQueryConfig = {
  setupListeners: false,
  baseUrl: '',
};

export const STORE_RTK_QUERY_CONFIG = new InjectionToken<StoreQueryConfig>('STORE_RTK_QUERY_CONFIG');
