import { Injector, type Signal, type WritableSignal, computed, inject, signal } from '@angular/core';
import {
  type EmptyFeatureResult,
  type SignalStoreFeature,
  type SignalStoreFeatureResult,
  signalStoreFeature,
  withHooks,
} from '@ngrx/signals';
import { type Selector, type UnknownAction, createSelector } from '@reduxjs/toolkit';
import { type Api, type EndpointDefinitions } from '@reduxjs/toolkit/query';

import {
  type AngularHooksModuleOptions,
  type Dispatch,
  type SelectSignalOptions,
  type StoreQueryConfig,
  setupRuntimeListeners,
} from 'ngrx-rtk-query/core';

type RuntimeApi<Definitions extends EndpointDefinitions = Record<string, any>> = Api<
  any,
  Definitions,
  string,
  string,
  any
>;

type InitializedRuntimeApi<Definitions extends EndpointDefinitions = Record<string, any>> = RuntimeApi<Definitions> & {
  dispatch: Dispatch;
  initApiStore: (
    setupFn: () => AngularHooksModuleOptions,
    bindingMetadata: {
      bindingKey: object;
      runtimeLabel: string;
    },
  ) => () => void;
  reducer: (state: unknown, action: UnknownAction) => unknown;
  reducerPath: string;
  util: {
    resetApiState: () => UnknownAction;
  };
};

type RegisteredApi = {
  api: InitializedRuntimeApi;
  injector: Injector;
  reducerPath: string;
  state: WritableSignal<Record<string, unknown>>;
  selectSignal: <K>(mapFn: (state: any) => K, options?: SelectSignalOptions<K>) => Signal<K>;
};

type MountedApiRegistry = {
  apis: Set<object>;
  reducerPaths: Map<string, object>;
};

const mountedApiRegistryKey = Symbol('ngrx-rtk-query/mounted-api-registry');

type MountedApiRegistryProps = {
  [mountedApiRegistryKey]: MountedApiRegistry;
};

type MountedApiRegistryFeatureResult = {
  state: {};
  props: MountedApiRegistryProps;
  methods: {};
};

type StoreMembersWithMountedApiRegistry = MountedApiRegistryProps;

const memoizedCreateSelector: AngularHooksModuleOptions['createSelector'] = (...input) => {
  const selectors = input.slice(0, -1);
  const projector = input[input.length - 1];

  return createSelector(selectors, projector, {
    devModeChecks: {
      identityFunctionCheck: 'never',
    },
  }) as unknown as Selector<any, any>;
};

const withMountedApiRegistry = ((store) => {
  const registryStore = store as typeof store & {
    props: Partial<MountedApiRegistryProps>;
  };
  const existingRegistry = registryStore.props[mountedApiRegistryKey];

  if (existingRegistry) {
    return {
      ...registryStore,
      props: registryStore.props as MountedApiRegistryProps,
    };
  }

  return {
    ...registryStore,
    props: {
      ...(registryStore.props ?? {}),
      [mountedApiRegistryKey]: {
        apis: new Set<object>(),
        reducerPaths: new Map<string, object>(),
      },
    } as MountedApiRegistryProps,
  };
}) as SignalStoreFeature<EmptyFeatureResult, MountedApiRegistryFeatureResult>;

const registerMountedApi = (store: StoreMembersWithMountedApiRegistry, api: InitializedRuntimeApi): (() => void) => {
  const registry = store[mountedApiRegistryKey];

  if (registry.apis.has(api)) {
    throw new Error(
      `RTK Query api instance for reducerPath "${api.reducerPath}" is already mounted in this signal store. Add withApi(api) only once per api instance.`,
    );
  }

  const registeredApi = registry.reducerPaths.get(api.reducerPath);

  if (registeredApi && registeredApi !== api) {
    throw new Error(
      `Duplicate RTK Query reducerPath "${api.reducerPath}" in signalStore. Each withApi(api) must use a unique reducerPath.`,
    );
  }

  registry.apis.add(api);
  registry.reducerPaths.set(api.reducerPath, api);

  return () => {
    registry.apis.delete(api);

    if (registry.reducerPaths.get(api.reducerPath) === api) {
      registry.reducerPaths.delete(api.reducerPath);
    }
  };
};

const createSignalStoreApi = (entry: RegisteredApi): (() => AngularHooksModuleOptions) => {
  return () => {
    const dispatch = (action: UnknownAction) => {
      const currentState = entry.state();
      const nextState = entry.api.reducer(currentState, action) as Record<string, unknown>;

      if (nextState !== currentState) {
        entry.state.set(nextState);
      }

      return action;
    };
    const getState = () => ({ [entry.reducerPath]: entry.state() });
    const useSelector = <K>(mapFn: (state: any) => K, options?: SelectSignalOptions<K>): Signal<K> =>
      entry.selectSignal(mapFn, options);
    const getInjector = () => entry.injector;

    return {
      hooks: {
        dispatch: dispatch as Dispatch,
        getState,
        useSelector,
      },
      createSelector: memoizedCreateSelector,
      getInjector,
    };
  };
};

export function withApi<TApi extends RuntimeApi<any>>(
  api: TApi,
  { setupListeners }: StoreQueryConfig = {},
): SignalStoreFeature<
  EmptyFeatureResult,
  {
    state: {};
    props: MountedApiRegistryProps;
    methods: {};
  }
> {
  const initializedApi = api as InitializedRuntimeApi;
  const initialState = initializedApi.reducer(undefined, {
    type: '@@ngrx-rtk-query/signal-store/init',
  }) as Record<string, unknown>;

  return signalStoreFeature(
    withMountedApiRegistry,
    withHooks((store) => {
      const injector = inject(Injector);
      const unregisterApi = registerMountedApi(store as unknown as StoreMembersWithMountedApiRegistry, initializedApi);
      const bindingKey = {};
      const state = signal(initialState);
      let releaseApiStore: (() => void) | undefined;
      let teardownListeners: (() => void) | undefined;
      const entry: RegisteredApi = {
        api: initializedApi,
        injector,
        reducerPath: initializedApi.reducerPath,
        state,
        selectSignal: (mapFn, options) => computed(() => mapFn({ [entry.reducerPath]: entry.state() }), options),
      };

      return {
        onInit: () => {
          try {
            releaseApiStore = initializedApi.initApiStore(createSignalStoreApi(entry), {
              bindingKey,
              runtimeLabel: 'signal-store',
            });
            initializedApi.dispatch(initializedApi.util.resetApiState());
            teardownListeners = setupRuntimeListeners(initializedApi.dispatch, setupListeners);
          } catch (error) {
            teardownListeners?.();
            releaseApiStore?.();
            unregisterApi();

            throw error;
          }
        },
        onDestroy: () => {
          teardownListeners?.();
          initializedApi.dispatch(initializedApi.util.resetApiState());
          releaseApiStore?.();
          unregisterApi();
        },
      };
    }),
  );
}
