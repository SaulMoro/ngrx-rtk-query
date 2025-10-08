import { type ValueEqualityFn } from '@angular/core';
import { type setupListeners as setupListenersFn } from '@reduxjs/toolkit/query';

export interface StoreQueryConfig {
  setupListeners?: Parameters<typeof setupListenersFn>[1] | false;
}

export interface SelectSignalOptions<T> {
  /**
   *  A comparison function which defines equality for select results.
   */
  equal?: ValueEqualityFn<T>;
}
