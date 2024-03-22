import {
  type CreateComputedOptions,
  ENVIRONMENT_INITIALIZER,
  type EnvironmentProviders,
  Injectable,
  Injector,
  type Signal,
  computed,
  inject,
  makeEnvironmentProviders,
  signal,
} from '@angular/core';
import { type Reducer, type Selector, type UnknownAction } from '@reduxjs/toolkit';
import { type Api, setupListeners as setupListenersFn } from '@reduxjs/toolkit/query';

import { type AngularHooksModuleOptions, type Dispatch, type StoreQueryConfig } from 'ngrx-rtk-query/core';

@Injectable()
export class ApiStore {
  readonly state = signal<Record<string, any>>({});

  selectSignal = <K>(mapFn: (state: any) => K, options?: CreateComputedOptions<K>): Signal<K> =>
    computed(() => mapFn(this.state()), options);

  dispatch = (action: UnknownAction, { reducerPath, reducer }: { reducerPath: string; reducer: Reducer<any> }) => {
    const nextState = reducer(this.state()[reducerPath], action as UnknownAction);
    this.state.update((state) => ({ ...state, [reducerPath]: nextState }));
  };
}

const createNoopStoreApi = (
  api: Api<any, Record<string, any>, string, string, any>,
  { injector = inject(Injector) }: { injector?: Injector } = {},
) => {
  const store = injector.get(ApiStore);
  const reducerPath = api.reducerPath;
  const reducer = api.reducer as Reducer<any>;

  // Initialize the store with the initial state
  store.state.update((state) => ({ ...state, [reducerPath]: {} }));

  return (): AngularHooksModuleOptions => {
    const dispatch = (action: UnknownAction) => {
      store.dispatch(action, { reducerPath, reducer });
      return action;
    };
    const getState = store.selectSignal((state) => state);
    const useSelector = <K>(mapFn: (state: any) => K, options?: CreateComputedOptions<K>): Signal<K> =>
      store.selectSignal(mapFn, options);

    const hooks = { dispatch: dispatch as Dispatch, getState, useSelector };
    const createSelector =
      <T = any, V = any>(...input: any[]): Selector<T, V> =>
      (state) =>
        input.reduce((acc, selector) => selector(acc), state);
    const getInjector = () => injector;

    return { hooks, createSelector, getInjector };
  };
};

export function provideNoopStoreApi(
  api: Api<any, Record<string, any>, string, string, any>,
  { setupListeners }: StoreQueryConfig = {},
): EnvironmentProviders {
  setupListeners === false ? undefined : setupListenersFn(api.dispatch, setupListeners);

  return makeEnvironmentProviders([
    ApiStore,
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue() {
        api.initApiStore(createNoopStoreApi(api));
      },
    },
  ]);
}
