import { provideStoreApi as provideStoreApiFromStore } from 'ngrx-rtk-query/store';

export * from 'ngrx-rtk-query/core';

/** @deprecated Import provideStoreApi from 'ngrx-rtk-query/store'. */
export const provideStoreApi = provideStoreApiFromStore;
