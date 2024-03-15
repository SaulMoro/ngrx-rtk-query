import {
  ENVIRONMENT_INITIALIZER,
  Injector,
  inject,
  makeEnvironmentProviders,
  type EnvironmentProviders,
  type Signal,
} from '@angular/core';
import { Store, createSelectorFactory, defaultMemoize, provideState, type Action } from '@ngrx/store';
import type { SelectSignalOptions } from '@ngrx/store/src/models';
import { setupListeners as setupListenersFn, type Api } from '@reduxjs/toolkit/query';
import type { AngularHooksModuleOptions, Dispatch } from './module';
import { shallowEqual } from './utils';

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
    const reducerPath = api.reducerPath as string;
    const getState = () => {
      const storeState: Record<string, any> = store.selectSignal((state) => state)();
      return storeState?.[reducerPath]
        ? storeState
        : // Query inside forFeature (Code splitting)
          { [reducerPath]: storeState };
    };
    const useSelector = <K>(mapFn: (state: any) => K, options?: SelectSignalOptions<K>): Signal<K> =>
      store.selectSignal(mapFn, options);

    const hooks = { dispatch: dispatch as Dispatch, getState, useSelector };
    const createSelector = createSelectorFactory((projector) => defaultMemoize(projector, shallowEqual, shallowEqual));
    const getInjector = () => injector;

    return { hooks, createSelector, getInjector };
  };
};

export interface StoreQueryConfig {
  setupListeners?: Parameters<typeof setupListenersFn>[1] | false;
}

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
