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
import { type Reducer, type UnknownAction } from '@reduxjs/toolkit';
import { type Api, setupListeners as setupListenersFn } from '@reduxjs/toolkit/query';

import {
  type AngularHooksModuleOptions,
  type Dispatch,
  type StoreQueryConfig,
  shallowEqual,
} from 'ngrx-rtk-query/core';

@Injectable({ providedIn: 'root' })
export class ApiStore {
  readonly #state = signal<Record<string, any>>({});

  selectSignal = <K>(mapFn: (state: any) => K, options?: CreateComputedOptions<K>): Signal<K> =>
    computed(() => mapFn(this.#state()), { equal: options?.equal });

  dispatch = (action: UnknownAction, { reducerPath, reducer }: { reducerPath: string; reducer: Reducer<any> }) => {
    const nextState = reducer(this.#state()[reducerPath], action as UnknownAction);
    this.#state.update((state) => ({ ...state, [reducerPath]: nextState }));
  };
}

const createNoopStoreApi = (
  api: Api<any, Record<string, any>, string, string, any>,
  { injector = inject(Injector) }: { injector?: Injector } = {},
) => {
  const store = injector.get(ApiStore);
  const reducerPath = api.reducerPath;
  const reducer = api.reducer as Reducer<any>;

  return (): AngularHooksModuleOptions => {
    const dispatch = (action: UnknownAction) => {
      store.dispatch(action, { reducerPath, reducer });
      return action;
    };
    const getState = store.selectSignal((state) => state);
    const useSelector = <K>(mapFn: (state: any) => K, options?: CreateComputedOptions<K>): Signal<K> =>
      computed(() => mapFn(getState()), { equal: options?.equal });

    const hooks = { dispatch: dispatch as Dispatch, getState, useSelector };
    const createSelector = (...input: any[]) => {
      return computed(() => input.reduce((acc, selector) => selector(acc), getState()), { equal: shallowEqual });
    };
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
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue() {
        api.initApiStore(createNoopStoreApi(api));
      },
    },
  ]);
}
