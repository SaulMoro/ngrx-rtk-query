import { type setupListeners as setupListenersFn } from '@reduxjs/toolkit/query';

export interface StoreQueryConfig {
  setupListeners?: Parameters<typeof setupListenersFn>[1] | false;
}
