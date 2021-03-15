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

  return function (reducer: ActionReducer<any>): ActionReducer<any> {
    return function (state: any, action: Action) {
      const nextState = reducer(state, action);
      const getNextState = () => nextState;

      anyApi.middleware({
        dispatch,
        getState: action.type === anyApi.internalActions.updateSubscriptionOptions.type ? getNextState : getState,
      })(() => nextState)(action);

      return nextState;
    };
  };
}
