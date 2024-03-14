import type { Signal } from '@angular/core';
import { Store, type Action } from '@ngrx/store';
import type { SelectSignalOptions } from '@ngrx/store/src/models';
import {
  buildCreateApi,
  coreModule,
  coreModuleName,
  type Api,
  type CoreModule,
  type CreateApi,
} from '@reduxjs/toolkit/query';
import { angularHooksModule, angularHooksModuleName, type AngularHooksModule, type Dispatch } from './module';

export const createApi: CreateApi<typeof coreModuleName | typeof angularHooksModuleName> = (options) => {
  const reducerPath = options.reducerPath as string;

  const next = (action: unknown): unknown => {
    if (typeof action === 'function') {
      return action(dispatch, storeState, { injector: getApiInjector() });
    }
    return storeDispatch(action as Action);
  };
  const dispatch = (action: unknown): unknown => middleware(next)(action);
  const getState = () => storeState();
  const useSelector = <K>(mapFn: (state: any) => K, options?: SelectSignalOptions<K>): Signal<K> =>
    storeSelect(mapFn, options);

  const createApi = /* @__PURE__ */ buildCreateApi(
    coreModule(),
    angularHooksModule({
      hooks: {
        dispatch: dispatch as Dispatch,
        getState,
        useSelector,
      },
    }),
  );
  const api = createApi(options);

  const getApiInjector = () => {
    const injector = (api as unknown as Api<any, Record<string, any>, string, string, AngularHooksModule | CoreModule>)
      .injector;
    if (!injector) {
      throw new Error(
        `Provide the API (${reducerPath}) is necessary to use the queries. Did you forget to provide the queries api?`,
      );
    }
    return injector;
  };

  const getStore = () => {
    const injector = getApiInjector();
    const store = injector.get(Store, undefined, { optional: true });
    if (!store) {
      throw new Error(`Provide the Store is necessary to use the queries. Did you forget to provide the store?`);
    }
    return store;
  };
  const storeDispatch = (action: Action) => {
    getStore().dispatch(action);
    return action;
  };
  const storeState = () => {
    const storeState: Record<string, any> = getStore().selectSignal((state) => state)();
    return storeState?.[reducerPath]
      ? storeState
      : // Query inside forFeature (Code splitting)
        { [reducerPath]: storeState };
  };
  const storeSelect = <K>(mapFn: (state: any) => K, options?: SelectSignalOptions<K>): Signal<K> =>
    getStore().selectSignal(mapFn, options);

  const middleware = (
    api as unknown as Api<any, Record<string, any>, string, string, AngularHooksModule | CoreModule>
  ).middleware({ dispatch, getState: storeState });

  return api;
};
