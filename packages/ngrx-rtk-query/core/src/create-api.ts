import { type Action, type UnknownAction } from '@reduxjs/toolkit';
import {
  type Api,
  type CoreModule,
  type CreateApi,
  buildCreateApi,
  coreModule,
  type coreModuleName,
} from '@reduxjs/toolkit/query';

import {
  type AngularHooksModule,
  type AngularHooksModuleOptions,
  type Dispatch,
  angularHooksModule,
  type angularHooksModuleName,
} from './module';

type ApiBindingMetadata = {
  bindingKey: object;
  runtimeLabel: string;
};

type ApiBinding = ApiBindingMetadata & {
  dispatch: (action: unknown) => unknown;
  store: AngularHooksModuleOptions;
};

type RuntimeApi = Api<any, Record<string, any>, string, string, AngularHooksModule | CoreModule>;

export const createApi: CreateApi<typeof coreModuleName | typeof angularHooksModuleName> = (options) => {
  let resolvedReducerPath = options.reducerPath ?? 'api';
  let activeBinding: ApiBinding | undefined;
  let isResetApiStateAction = (_action: unknown): _action is UnknownAction => false;
  const getUnboundStoreError = () => {
    return new Error(
      `Provide the API (${resolvedReducerPath}) is necessary to use the queries. Did you forget to provide the queries api?`,
    );
  };
  const getBoundStore = (): AngularHooksModuleOptions => {
    if (!activeBinding) {
      throw getUnboundStoreError();
    }

    return activeBinding.store;
  };
  const dispatch = (action: unknown): unknown => {
    if (!activeBinding) {
      if (isResetApiStateAction(action)) {
        return action;
      }

      throw getUnboundStoreError();
    }

    return activeBinding.dispatch(action);
  };

  const getState: AngularHooksModuleOptions['hooks']['getState'] = () => getBoundStore().hooks.getState();
  const useSelector: AngularHooksModuleOptions['hooks']['useSelector'] = (mapFn, options) =>
    getBoundStore().hooks.useSelector(mapFn, options);
  const createSelector: AngularHooksModuleOptions['createSelector'] = (...input) =>
    getBoundStore().createSelector(...input);
  const getInjector: AngularHooksModuleOptions['getInjector'] = () => getBoundStore().getInjector();

  const createApi = /* @__PURE__ */ buildCreateApi(
    coreModule(),
    angularHooksModule({
      hooks: {
        dispatch: dispatch as Dispatch,
        getState,
        useSelector,
      },
      createSelector,
      getInjector,
    }),
  );
  const api = createApi(options);
  const runtimeApi = api as unknown as RuntimeApi;
  resolvedReducerPath = (api as unknown as { reducerPath: string }).reducerPath;
  isResetApiStateAction = (action: unknown): action is UnknownAction => runtimeApi.util.resetApiState.match(action);

  const createBinding = (setupFn: () => AngularHooksModuleOptions, bindingMetadata: ApiBindingMetadata): ApiBinding => {
    const store = setupFn();
    const getState: AngularHooksModuleOptions['hooks']['getState'] = () => store.hooks.getState();
    const next = (action: unknown): unknown => {
      if (typeof action === 'function') {
        return action(dispatchForBinding as Dispatch, getState, { injector: store.getInjector() });
      }

      return store.hooks.dispatch(action as Action);
    };
    const runMiddleware = runtimeApi.middleware({ dispatch: dispatchForBinding, getState })(next);

    function dispatchForBinding(action: unknown): unknown {
      return runMiddleware(action);
    }

    return {
      ...bindingMetadata,
      store,
      dispatch: dispatchForBinding,
    };
  };

  const initApiStore = (
    setupFn: () => AngularHooksModuleOptions,
    nextBindingMetadata: ApiBindingMetadata = {
      bindingKey: {},
      runtimeLabel: 'unknown',
    },
  ) => {
    if (activeBinding && activeBinding.bindingKey !== nextBindingMetadata.bindingKey) {
      throw new Error(
        `RTK Query api instance for reducerPath "${resolvedReducerPath}" is already bound to another host (${activeBinding.runtimeLabel}). Reuse one host per api instance or create a second api instance.`,
      );
    }

    const binding = createBinding(setupFn, nextBindingMetadata);
    activeBinding = binding;

    return () => {
      if (activeBinding?.bindingKey === nextBindingMetadata.bindingKey) {
        activeBinding = undefined;
      }
    };
  };
  Object.assign(api, { initApiStore });

  return api;
};
