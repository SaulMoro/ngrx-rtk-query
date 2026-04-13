import { Injector, type Signal, type WritableSignal, computed, inject, signal } from '@angular/core';
import { type SignalStoreFeature, type SignalStoreFeatureResult, signalStoreFeature, withHooks } from '@ngrx/signals';
import { type Selector, type UnknownAction, createSelector } from '@reduxjs/toolkit';
import {
  type Api,
  type ApiEndpointInfiniteQuery,
  type ApiEndpointMutation,
  type ApiEndpointQuery,
  type EndpointDefinitions,
  type InfiniteQueryArgFrom,
  type InfiniteQueryDefinition,
  type InfiniteQueryResultSelectorResult,
  type MutationDefinition,
  type MutationResultSelectorResult,
  type QueryArgFrom,
  type QueryDefinition,
  type QueryResultSelectorResult,
  type SkipToken,
} from '@reduxjs/toolkit/query';

import {
  type AngularHooksModuleOptions,
  type Dispatch,
  type SelectSignalOptions,
  type StoreQueryConfig,
  setupRuntimeListeners,
} from 'ngrx-rtk-query/core';

type MutationSelectorArg = {
  fixedCacheKey: string;
};

type RuntimeApi = Api<any, Record<string, any>, string, string, any>;

type InitializedRuntimeApi = RuntimeApi & {
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

type RegisteredEndpoint = {
  entry: RegisteredApi;
  endpointName: string;
};

type SharedRuntime = {
  apisByReducerPath: Map<string, RegisteredApi>;
  endpoints: WeakMap<object, RegisteredEndpoint>;
  register: (entry: RegisteredApi) => void;
  unregister: (entry: RegisteredApi) => void;
  selectApiState: SelectApiState;
};

type SharedRuntimeMethods = {
  selectApiState: SelectApiState;
};

const runtimeBySelector = new WeakMap<SelectApiState, SharedRuntime>();

export type SelectApiState = {
  <Definition extends QueryDefinition<any, any, any, any, any>, Definitions extends EndpointDefinitions>(
    endpoint: ApiEndpointQuery<Definition, Definitions>,
    ...args: QueryArgFrom<Definition> extends void
      ? [
          arg?: QueryArgFrom<Definition> | SkipToken,
          options?: SelectSignalOptions<QueryResultSelectorResult<Definition>>,
        ]
      : [
          arg: QueryArgFrom<Definition> | SkipToken,
          options?: SelectSignalOptions<QueryResultSelectorResult<Definition>>,
        ]
  ): Signal<QueryResultSelectorResult<Definition>>;
  <Definition extends InfiniteQueryDefinition<any, any, any, any, any>, Definitions extends EndpointDefinitions>(
    endpoint: ApiEndpointInfiniteQuery<Definition, Definitions>,
    ...args: InfiniteQueryArgFrom<Definition> extends void
      ? [
          arg?: InfiniteQueryArgFrom<Definition> | SkipToken,
          options?: SelectSignalOptions<InfiniteQueryResultSelectorResult<Definition>>,
        ]
      : [
          arg: InfiniteQueryArgFrom<Definition> | SkipToken,
          options?: SelectSignalOptions<InfiniteQueryResultSelectorResult<Definition>>,
        ]
  ): Signal<InfiniteQueryResultSelectorResult<Definition>>;
  <Definition extends MutationDefinition<any, any, any, any, any>, Definitions extends EndpointDefinitions>(
    endpoint: ApiEndpointMutation<Definition, Definitions>,
    arg: MutationSelectorArg,
    options?: SelectSignalOptions<MutationResultSelectorResult<Definition>>,
  ): Signal<MutationResultSelectorResult<Definition>>;
};

const memoizedCreateSelector: AngularHooksModuleOptions['createSelector'] = (...input) => {
  const selectors = input.slice(0, -1);
  const projector = input[input.length - 1];

  return createSelector(selectors, projector, {
    devModeChecks: {
      identityFunctionCheck: 'never',
    },
  }) as unknown as Selector<any, any>;
};

const createSelectApiState = (runtime: SharedRuntime): SelectApiState =>
  ((endpoint: object, arg: unknown, options?: SelectSignalOptions<unknown>) => {
    const registration = runtime.endpoints.get(endpoint);

    if (!registration) {
      throw new Error(`Endpoint is not registered in this signal store. Add the owning API with withApi(api).`);
    }

    const { entry, endpointName } = registration;

    if ('useMutation' in (endpoint as ApiEndpointMutation<any, any>)) {
      const fixedCacheKey = (arg as MutationSelectorArg | undefined)?.fixedCacheKey;

      if (typeof fixedCacheKey !== 'string' || fixedCacheKey.length === 0) {
        throw new Error(
          `Mutation endpoint "${endpointName}" from reducerPath "${entry.reducerPath}" requires a valid fixedCacheKey for selectApiState().`,
        );
      }

      return entry.selectSignal(
        (endpoint as ApiEndpointMutation<any, any>).select({ fixedCacheKey, requestId: undefined }),
        options,
      );
    }

    return entry.selectSignal(
      (endpoint as ApiEndpointQuery<any, any> | ApiEndpointInfiniteQuery<any, any>).select(arg as any),
      options,
    );
  }) as SelectApiState;

const createSharedRuntime = (): SharedRuntime => {
  const runtime: SharedRuntime = {
    apisByReducerPath: new Map<string, RegisteredApi>(),
    endpoints: new WeakMap<object, RegisteredEndpoint>(),
    register: (entry) => {
      runtime.apisByReducerPath.set(entry.reducerPath, entry);

      for (const [endpointName, endpoint] of Object.entries(entry.api.endpoints) as Array<[string, object]>) {
        runtime.endpoints.set(endpoint, { entry, endpointName });
      }
    },
    unregister: (entry) => {
      runtime.apisByReducerPath.delete(entry.reducerPath);

      for (const endpoint of Object.values(entry.api.endpoints) as object[]) {
        runtime.endpoints.delete(endpoint);
      }
    },
    selectApiState: undefined as unknown as SelectApiState,
  };

  runtime.selectApiState = createSelectApiState(runtime);

  return runtime;
};

const getSharedRuntime = (store: SharedRuntimeMethods): SharedRuntime => {
  const runtime = runtimeBySelector.get(store.selectApiState);

  if (!runtime) {
    throw new Error(
      `RTK Query signal-store runtime is not initialized for this host store. Add withApi(api) to the host store.`,
    );
  }

  return runtime;
};

const withSharedRuntimeSurface = ((store) => {
  const runtimeStore = store as typeof store & {
    methods: Partial<SharedRuntimeMethods>;
  };
  const existingSelectApiState = runtimeStore.methods.selectApiState as SelectApiState | undefined;

  if (existingSelectApiState) {
    if (!runtimeBySelector.has(existingSelectApiState)) {
      throw new Error(
        'Signal Store already defines a "selectApiState" method. Rename the existing method or remove withApi(api).',
      );
    }

    return {
      ...runtimeStore,
      methods: runtimeStore.methods as SharedRuntimeMethods,
    };
  }

  const runtime = createSharedRuntime();
  runtimeBySelector.set(runtime.selectApiState, runtime);

  return {
    ...runtimeStore,
    methods: {
      ...runtimeStore.methods,
      selectApiState: runtime.selectApiState,
    } as SharedRuntimeMethods,
  };
}) as SignalStoreFeature<
  SignalStoreFeatureResult,
  {
    state: {};
    props: {};
    methods: SharedRuntimeMethods;
  }
>;

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

export function withApi(
  api: RuntimeApi,
  { setupListeners }: StoreQueryConfig = {},
): SignalStoreFeature<SignalStoreFeatureResult, { state: {}; props: {}; methods: SharedRuntimeMethods }> {
  const initializedApi = api as InitializedRuntimeApi;
  const initialState = initializedApi.reducer(undefined, {
    type: '@@ngrx-rtk-query/signal-store/init',
  }) as Record<string, unknown>;

  return signalStoreFeature(
    withSharedRuntimeSurface,
    withHooks((store) => {
      const injector = inject(Injector);
      const runtime = getSharedRuntime(store);
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

      if (runtime.apisByReducerPath.has(initializedApi.reducerPath)) {
        throw new Error(
          `Duplicate RTK Query reducerPath "${initializedApi.reducerPath}" in signalStore. Each withApi(api) must use a unique reducerPath.`,
        );
      }

      runtime.register(entry);

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
            runtime.unregister(entry);

            throw error;
          }
        },
        onDestroy: () => {
          teardownListeners?.();
          initializedApi.dispatch(initializedApi.util.resetApiState());
          releaseApiStore?.();
          runtime.unregister(entry);
        },
      };
    }),
  );
}
