import type { ActionReducer, MetaReducer, Action } from '@ngrx/store';
import type { Api } from '@reduxjs/toolkit/query';
import type { CoreModule } from '@reduxjs/toolkit/dist/query/core/module';
import type { AngularHooksModule, AngularHooksModuleOptions } from './module';

export function buildMetaReducer({
  api,
  moduleOptions: { useDispatch: dispatch },
}: {
  api: any;
  moduleOptions: Required<Pick<AngularHooksModuleOptions, 'useDispatch'>>;
}): MetaReducer<any> {
  const anyApi = api as Api<any, Record<string, any>, string, string, AngularHooksModule | CoreModule>;

  let nextState: any;
  const getState = () =>
    // Query inside forFeature (Code splitting)
    !nextState || nextState[anyApi.reducerPath] ? nextState : { [anyApi.reducerPath]: nextState };

  const middleware = anyApi.middleware({ dispatch, getState })(getState);

  return function (reducer: ActionReducer<any>): ActionReducer<any> {
    return function (state: any, action: Action) {
      nextState = reducer(state, action);
      middleware(action);
      return nextState;
    };
  };
}
