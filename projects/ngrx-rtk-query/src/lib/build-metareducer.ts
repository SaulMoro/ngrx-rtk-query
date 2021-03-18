import { ActionReducer, MetaReducer, Action } from '@ngrx/store';
import { Api } from '@rtk-incubator/rtk-query';
import { CoreModule } from '@rtk-incubator/rtk-query/dist/esm/ts/core/module';
import { AngularHooksModule, AngularHooksModuleOptions } from './module';

export function buildMetaReducer({
  api,
  moduleOptions: { useDispatch: dispatch, getState },
}: {
  api: any;
  moduleOptions: Required<Pick<AngularHooksModuleOptions, 'useDispatch' | 'getState'>>;
}): MetaReducer<any> {
  const anyApi = api as Api<any, Record<string, any>, string, string, AngularHooksModule | CoreModule>;
  const { unsubscribeQueryResult } = anyApi.internalActions;

  return function (reducer: ActionReducer<any>): ActionReducer<any> {
    return function (state: any, action: Action) {
      const nextState = reducer(state, action);
      let getNextState = () => nextState;

      // Query inside forFeature (Code splitting)
      if (!nextState[anyApi.reducerPath]) {
        getNextState = () => ({ [anyApi.reducerPath]: nextState });
      }

      anyApi.middleware({
        dispatch,
        /**
         * The unsuscriptQueryResult Action to remove unsubscriptions (handleUnsubscribe)
         * dispatch a function with setTimeout. This function needs the state of the store after the
         * tiemout so we have to pass the reference of the state with getState.
         */
        getState: unsubscribeQueryResult.match(action) ? getState : getNextState,
      })(getNextState)(action);

      return nextState;
    };
  };
}
