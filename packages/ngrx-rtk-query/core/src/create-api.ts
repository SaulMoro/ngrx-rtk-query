import { type Action } from '@reduxjs/toolkit';
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

export const createApi: CreateApi<typeof coreModuleName | typeof angularHooksModuleName> = (options) => {
  let resolvedReducerPath = options.reducerPath ?? 'api';
  const getUnboundStoreError = () => {
    return new Error(
      `Provide the API (${resolvedReducerPath}) is necessary to use the queries. Did you forget to provide the queries api?`,
    );
  };
  const getBoundStore = (): AngularHooksModuleOptions => {
    if (!store) {
      throw getUnboundStoreError();
    }

    return store;
  };
  const next = (action: unknown): unknown => {
    if (typeof action === 'function') {
      return action(dispatch, getState, { injector: getInjector() });
    }

    return getBoundStore().hooks.dispatch(action as Action);
  };
  const dispatch = (action: unknown): unknown => {
    return middleware(next)(action);
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
  resolvedReducerPath = (api as unknown as { reducerPath: string }).reducerPath;

  let store: AngularHooksModuleOptions | undefined;
  let bindingMetadata: ApiBindingMetadata | undefined;

  const initApiStore = (
    setupFn: () => AngularHooksModuleOptions,
    nextBindingMetadata: ApiBindingMetadata = {
      bindingKey: {},
      runtimeLabel: 'unknown',
    },
  ) => {
    if (bindingMetadata && bindingMetadata.bindingKey !== nextBindingMetadata.bindingKey) {
      throw new Error(
        `RTK Query api instance for reducerPath "${resolvedReducerPath}" is already bound to another host (${bindingMetadata.runtimeLabel}). Reuse one host per api instance or create a second api instance.`,
      );
    }

    store = setupFn();
    bindingMetadata = nextBindingMetadata;

    return () => {
      if (bindingMetadata?.bindingKey === nextBindingMetadata.bindingKey) {
        bindingMetadata = undefined;
        store = undefined;
      }
    };
  };
  Object.assign(api, { initApiStore });

  const middleware = (
    api as unknown as Api<any, Record<string, any>, string, string, AngularHooksModule | CoreModule>
  ).middleware({ dispatch, getState });

  return api;
};
