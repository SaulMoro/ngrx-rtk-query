import {
  type CreateComputedOptions,
  DestroyRef,
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
import { type Api } from '@reduxjs/toolkit/query';

import {
  type AngularHooksModuleOptions,
  type Dispatch,
  type StoreQueryConfig,
  setupRuntimeListeners,
} from 'ngrx-rtk-query/core';

@Injectable()
export class ApiStore {
  readonly state = signal<Record<string, any>>({});

  selectSignal = <K>(mapFn: (state: any) => K, options?: CreateComputedOptions<K>): Signal<K> =>
    computed(() => mapFn(this.state()), options);

  dispatch = (action: UnknownAction, { reducerPath, reducer }: { reducerPath: string; reducer: Reducer<any> }) => {
    const currentState = this.state();
    const currentSliceState = currentState[reducerPath];
    const nextState = reducer(currentSliceState, action as UnknownAction);

    if (nextState === currentSliceState) {
      return;
    }

    this.state.set({ ...currentState, [reducerPath]: nextState });
  };
}

const createNoopStoreApi = (
  api: Api<any, Record<string, any>, string, string, any>,
  { injector = inject(Injector) }: { injector?: Injector } = {},
) => {
  return (): AngularHooksModuleOptions => {
    const store = injector.get(ApiStore);
    const reducerPath = api.reducerPath;
    const reducer = api.reducer as Reducer<any>;

    // Initialize the store with the initial state
    store.state.update((state) => ({ ...state, [reducerPath]: {} }));

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
  return makeEnvironmentProviders([
    ApiStore,
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue() {
        const destroyRef = inject(DestroyRef);
        const bindingMetadata = {
          bindingKey: {},
          runtimeLabel: 'noop-store',
        };
        let releaseApiStore: (() => void) | undefined;
        let teardownListeners: (() => void) | undefined;

        try {
          releaseApiStore = api.initApiStore(createNoopStoreApi(api), bindingMetadata);
          teardownListeners = setupRuntimeListeners(api.dispatch as Dispatch, setupListeners);

          api.dispatch(api.util.resetApiState());
        } catch (error) {
          teardownListeners?.();
          releaseApiStore?.();

          throw error;
        }

        destroyRef.onDestroy(() => {
          teardownListeners?.();
          api.dispatch(api.util.resetApiState());
          releaseApiStore?.();
        });
      },
    },
  ]);
}
