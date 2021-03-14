import { ActionReducer, MetaReducer, Action } from '@ngrx/store';
import { Middleware, ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
import { AngularHooksModuleOptions } from './module';

export function buildMetaReducer({
  middleware,
  moduleOptions: { useDispatch: dispatch, getState },
}: {
  middleware: Middleware<{}, any, ThunkDispatch<any, any, AnyAction>>;
  moduleOptions: Required<Pick<AngularHooksModuleOptions, 'useDispatch' | 'getState'>>;
}): MetaReducer<any> {
  return function (reducer: ActionReducer<any>): ActionReducer<any> {
    return function (state: any, action: Action) {
      const newState = middleware({ dispatch, getState })(() => state)(action);
      return reducer(newState, action);
    };
  };
}
