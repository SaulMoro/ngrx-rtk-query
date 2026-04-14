import { type Signal } from '@angular/core';
import { type SignalStoreFeature, type SignalStoreFeatureResult, signalStoreFeature, withMethods } from '@ngrx/signals';
import {
  type Api,
  type ApiEndpointInfiniteQuery,
  type ApiEndpointMutation,
  type ApiEndpointQuery,
  type EndpointDefinitions,
} from '@reduxjs/toolkit/query';

import { type SelectSignalOptions } from 'ngrx-rtk-query/core';

import {
  type EndpointStateMethodsFromApi,
  type GeneratedStateMethod,
  type MutationSelectorArg,
} from './types/state-methods';

type RuntimeApi<Definitions extends EndpointDefinitions = Record<string, any>> = Api<
  any,
  Definitions,
  string,
  string,
  any
> & {
  reducerPath: string;
  selectSignal: <K>(mapFn: (state: any) => K, options?: SelectSignalOptions<K>) => Signal<K>;
};

type ApiStateRegistry = {
  apis: Set<object>;
  generatedMethodOwners: Map<
    string,
    {
      api: object;
      reducerPath: string;
    }
  >;
};

const apiStateRegistryKey = Symbol('ngrx-rtk-query/api-state-registry');

type ApiStateRegistryProps = {
  [apiStateRegistryKey]: ApiStateRegistry;
};

type ApiStateRegistryFeatureResult = {
  state: {};
  props: ApiStateRegistryProps;
  methods: {};
};

type StoreMembersWithApiStateRegistry = ApiStateRegistryProps & Record<string | symbol, unknown>;

const withApiStateRegistry = ((store) => {
  const registryStore = store as typeof store & {
    props: Partial<ApiStateRegistryProps>;
  };
  const existingRegistry = registryStore.props[apiStateRegistryKey];

  if (existingRegistry) {
    return {
      ...registryStore,
      props: registryStore.props as ApiStateRegistryProps,
    };
  }

  return {
    ...registryStore,
    props: {
      ...(registryStore.props ?? {}),
      [apiStateRegistryKey]: {
        apis: new Set<object>(),
        generatedMethodOwners: new Map<string, { api: object; reducerPath: string }>(),
      },
    } as ApiStateRegistryProps,
  };
}) as SignalStoreFeature<SignalStoreFeatureResult, ApiStateRegistryFeatureResult>;

// Defer selector creation so generated state methods can be captured during store composition
// before any runtime has mounted the API instance.
const deferSignalCreation = <T>(factory: () => Signal<T>): Signal<T> => {
  let currentSignal: Signal<T> | undefined;

  return (() => {
    currentSignal ??= factory();
    return currentSignal();
  }) as Signal<T>;
};

const createGeneratedStateMethods = (
  store: StoreMembersWithApiStateRegistry,
  api: RuntimeApi,
): Record<string, GeneratedStateMethod> => {
  const registry = store[apiStateRegistryKey];
  const methods: Record<string, GeneratedStateMethod> = {};

  if (registry.apis.has(api)) {
    throw new Error(
      `RTK Query signal-store already exposes state methods for reducerPath "${api.reducerPath}". Add withApiState(api) only once per api instance in a store.`,
    );
  }

  for (const [endpointName, endpoint] of Object.entries(api.endpoints)) {
    const generatedMethodName = `${endpointName}State`;
    const existingOwner = registry.generatedMethodOwners.get(generatedMethodName);

    if (existingOwner && existingOwner.api !== api) {
      throw new Error(
        `RTK Query signal-store cannot generate "${generatedMethodName}" for reducerPath "${api.reducerPath}" because reducerPath "${existingOwner.reducerPath}" already exposes that method.`,
      );
    }

    if (generatedMethodName in store || generatedMethodName in methods) {
      throw new Error(
        `RTK Query signal-store cannot generate "${generatedMethodName}" for reducerPath "${api.reducerPath}" because that store member already exists.`,
      );
    }

    methods[generatedMethodName] = (arg?: unknown, options?: SelectSignalOptions<unknown>) => {
      if ('useMutation' in (endpoint as ApiEndpointMutation<any, any>)) {
        const fixedCacheKey = (arg as MutationSelectorArg | undefined)?.fixedCacheKey;

        if (typeof fixedCacheKey !== 'string' || fixedCacheKey.length === 0) {
          throw new Error(
            `Mutation endpoint "${endpointName}" from reducerPath "${api.reducerPath}" requires a valid fixedCacheKey for "${generatedMethodName}()".`,
          );
        }

        return deferSignalCreation(() =>
          api.selectSignal(
            (endpoint as ApiEndpointMutation<any, any>).select({ fixedCacheKey, requestId: undefined }),
            options,
          ),
        ) as Signal<unknown>;
      }

      return deferSignalCreation(() =>
        api.selectSignal(
          (endpoint as ApiEndpointQuery<any, any> | ApiEndpointInfiniteQuery<any, any>).select(arg as any),
          options,
        ),
      ) as Signal<unknown>;
    };
  }

  registry.apis.add(api);

  for (const generatedMethodName of Object.keys(methods)) {
    registry.generatedMethodOwners.set(generatedMethodName, {
      api,
      reducerPath: api.reducerPath,
    });
  }

  return methods;
};

export function withApiState<Input extends SignalStoreFeatureResult, TApi extends RuntimeApi<any>>(
  api: TApi,
): SignalStoreFeature<
  Input,
  {
    state: {};
    props: ApiStateRegistryProps;
    methods: EndpointStateMethodsFromApi<TApi>;
  }
> {
  return signalStoreFeature(
    withApiStateRegistry,
    withMethods((store) => createGeneratedStateMethods(store as unknown as StoreMembersWithApiStateRegistry, api)),
  ) as unknown as SignalStoreFeature<
    Input,
    {
      state: {};
      props: ApiStateRegistryProps;
      methods: EndpointStateMethodsFromApi<TApi>;
    }
  >;
}
