import {
  DestroyRef,
  ENVIRONMENT_INITIALIZER,
  type EnvironmentProviders,
  Injector,
  type Signal,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { type Action, Store, createSelectorFactory, defaultMemoize, provideState } from '@ngrx/store';
import { type Api } from '@reduxjs/toolkit/query';

import {
  type AngularHooksModuleOptions,
  type Dispatch,
  type SelectSignalOptions,
  type StoreQueryConfig,
  shallowEqual,
  type ɵInternalRuntimeMountApi,
  ɵinternalMountRuntimeApi,
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
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue() {
        const destroyRef = inject(DestroyRef);
        const bindingKey = {};
        const releaseRuntime = ɵinternalMountRuntimeApi({
          api: api as unknown as ɵInternalRuntimeMountApi,
          setupFn: createStoreApi(api),
          bindingKey,
          runtimeLabel: 'store',
          setupListeners,
        });

        destroyRef.onDestroy(() => {
          releaseRuntime();
        });
      },
    },
    provideState(api.reducerPath, api.reducer),
  ]);
}
