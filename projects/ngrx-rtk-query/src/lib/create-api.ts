import { type Action } from '@ngrx/store';
import {
  buildCreateApi,
  coreModule,
  coreModuleName,
  type Api,
  type CoreModule,
  type CreateApi,
} from '@reduxjs/toolkit/query';
import { angularHooksModule, angularHooksModuleName, type AngularHooksModule, type Dispatch } from './module';

import { dispatch as _dispatch, getState as _getState, select } from './thunk.service';

export const createApi: CreateApi<typeof coreModuleName | typeof angularHooksModuleName> = (options) => {
  const reducerPath = options.reducerPath as string;
  const getState = () => {
    const storeState = _getState();
    return storeState?.[reducerPath]
      ? storeState
      : // Query inside forFeature (Code splitting)
        { [reducerPath]: storeState };
  };

  const next = (action: unknown): unknown => {
    if (typeof action === 'function') {
      return action(dispatch, getState, {});
    }
    return _dispatch(action as Action);
  };
  const dispatch = (action: unknown): unknown => middleware(next)(action);

  const createApi = /* @__PURE__ */ buildCreateApi(
    coreModule(),
    angularHooksModule({
      hooks: {
        dispatch: dispatch as Dispatch,
        getState,
        useSelector: select,
      },
    }),
  );
  const api = createApi(options);

  const middleware = (
    api as unknown as Api<any, Record<string, any>, string, string, AngularHooksModule | CoreModule>
  ).middleware({ dispatch, getState });

  return api;
};
