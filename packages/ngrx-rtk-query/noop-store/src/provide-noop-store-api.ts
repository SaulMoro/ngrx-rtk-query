import {
  ENVIRONMENT_INITIALIZER,
  type EnvironmentProviders,
  Injector,
  type Signal,
  computed,
  inject,
  makeEnvironmentProviders,
  signal,
} from '@angular/core';
import { type Action } from '@ngrx/store';
import { type SelectSignalOptions } from '@ngrx/store/src/models';
import { type Reducer, type UnknownAction } from '@reduxjs/toolkit';
import { type Api, setupListeners as setupListenersFn } from '@reduxjs/toolkit/query';

import { type AngularHooksModuleOptions, type Dispatch, shallowEqual } from 'ngrx-rtk-query/core';

const createNoopStoreApi = (
  api: Api<any, Record<string, any>, string, string, any>,
  { injector = inject(Injector) }: { injector?: Injector } = {},
) => {
  const reducerPath = api.reducerPath;
  const reducer = api.reducer as Reducer<any>;
  const state = signal<Record<string, any>>({});

  return (): AngularHooksModuleOptions => {
    const getState = computed(() => ({ [reducerPath]: state() }));
    const dispatch = (action: Action) => {
      state.set(reducer(state(), action as UnknownAction));
      return action;
    };
    const useSelector = <K>(mapFn: (state: any) => K, options?: SelectSignalOptions<K>): Signal<K> =>
      computed(() => mapFn(getState()), { equal: options?.equal });

    const hooks = { dispatch: dispatch as Dispatch, getState, useSelector };
    const createSelector = (...input: any[]) => {
      return computed(() => input.reduce((acc, selector) => selector(acc), getState()), { equal: shallowEqual });
    };
    const getInjector = () => injector;

    return { hooks, createSelector, getInjector };
  };
};

export interface StoreQueryConfig {
  setupListeners?: Parameters<typeof setupListenersFn>[1] | false;
}

export function provideNoopStoreApi(
  api: Api<any, Record<string, any>, string, string, any>,
  { setupListeners }: StoreQueryConfig = {},
): EnvironmentProviders {
  setupListeners === false ? undefined : setupListenersFn(api.dispatch, setupListeners);

  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue() {
        api.initApiStore(createNoopStoreApi(api));
      },
    },
  ]);
}
