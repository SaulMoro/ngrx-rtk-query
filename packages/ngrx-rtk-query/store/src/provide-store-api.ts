import {
  ENVIRONMENT_INITIALIZER,
  Injector,
  inject,
  makeEnvironmentProviders,
  type EnvironmentProviders,
  type Signal,
} from '@angular/core';
import { Store, createSelectorFactory, defaultMemoize, provideState, type Action } from '@ngrx/store';
import { setupListeners as setupListenersFn, type Api } from '@reduxjs/toolkit/query';

import {
  type SelectSignalOptions,
  shallowEqual,
  type AngularHooksModuleOptions,
  type Dispatch,
  type StoreQueryConfig
} from 'ngrx-rtk-query/core';

const createStoreApi = (
  api: Api<any, Record<string, any>, string, string, any>,
  { injector = inject(Injector) }: { injector?: Injector } = {},
) => {
  return (): AngularHooksModuleOptions => {
    const store = injector.get(Store, undefined, { optional: true });
    if (!store) {
      throw new Error(`Provide the Store is necessary to use the queries. Did you forget to provide the store?`);
    }

    const dispatch = (action: Action) => {
      store.dispatch(action);
      return action;
    };
    const getState = store.selectSignal((state) => state);
    const useSelector = <K>(mapFn: (state: any) => K, options?: SelectSignalOptions<K>): Signal<K> =>
      store.selectSignal(mapFn, options);

    const hooks = { dispatch: dispatch as Dispatch, getState, useSelector };
    const createSelector = createSelectorFactory((projector) => defaultMemoize(projector, shallowEqual, shallowEqual));
    const getInjector = () => injector;

    return { hooks, createSelector, getInjector };
  };
};

export function provideStoreApi(
  api: Api<any, Record<string, any>, string, string, any>,
  { setupListeners }: StoreQueryConfig = {},
): EnvironmentProviders {
  setupListeners === false ? undefined : setupListenersFn(api.dispatch, setupListeners);

  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue() {
        api.initApiStore(createStoreApi(api));
      },
    },
    provideState(api.reducerPath, api.reducer),
  ]);
}
