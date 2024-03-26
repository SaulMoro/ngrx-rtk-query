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

export const createApi: CreateApi<typeof coreModuleName | typeof angularHooksModuleName> = (options) => {
  const next = (action: unknown): unknown => {
    if (typeof action === 'function') {
      return action(dispatch, getState, { injector: getInjector() });
    }
    return store.hooks.dispatch(action as Action);
  };
  const dispatch = (action: unknown): unknown => {
    if (!store) {
      const reducerPath = options.reducerPath;
      throw new Error(
        `Provide the API (${reducerPath}) is necessary to use the queries. Did you forget to provide the queries api?`,
      );
    }
    return middleware(next)(action);
  };

  const getState: AngularHooksModuleOptions['hooks']['getState'] = () => store.hooks.getState();
  const useSelector: AngularHooksModuleOptions['hooks']['useSelector'] = (mapFn, options) =>
    store?.hooks.useSelector(mapFn, options);
  const createSelector: AngularHooksModuleOptions['createSelector'] = (...input) => store.createSelector(...input);
  const getInjector: AngularHooksModuleOptions['getInjector'] = () => store.getInjector();

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

  let store: AngularHooksModuleOptions;
  const initApiStore = (setupFn: () => AngularHooksModuleOptions) => {
    store = setupFn();
  };
  Object.assign(api, { initApiStore });

  const middleware = (
    api as unknown as Api<any, Record<string, any>, string, string, AngularHooksModule | CoreModule>
  ).middleware({ dispatch, getState });

  return api;
};
