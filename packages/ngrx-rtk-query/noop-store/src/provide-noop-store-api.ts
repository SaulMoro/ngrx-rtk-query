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
  type ɵInternalRuntimeMountApi,
  ɵinternalMountRuntimeApi,
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

    const initialState = reducer(undefined, {
      type: '@@ngrx-rtk-query/noop-store/init',
    });
    store.state.update((state) => ({ ...state, [reducerPath]: initialState }));

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
        const bindingKey = {};
        const releaseRuntime = ɵinternalMountRuntimeApi({
          api: api as unknown as ɵInternalRuntimeMountApi,
          setupFn: createNoopStoreApi(api),
          bindingKey,
          runtimeLabel: 'noop-store',
          setupListeners,
        });

        destroyRef.onDestroy(() => {
          releaseRuntime();
        });
      },
    },
  ]);
}
