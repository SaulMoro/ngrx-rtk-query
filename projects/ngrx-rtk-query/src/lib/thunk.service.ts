import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import { InternalMiddlewareState } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types';
import { Observable } from 'rxjs';

let service: ThunkService;
let delayedActions: Action[] = [];
export const internalBatchState: InternalMiddlewareState = {
  currentSubscriptions: {},
};

export function dispatch(action: Action): Action;
export function dispatch<R>(action: ThunkAction<R, any, any, AnyAction>): R;
export function dispatch<R>(action: Action | ThunkAction<R, any, any, AnyAction>): R | Action;
export function dispatch<R>(action: Action | ThunkAction<R, any, any, AnyAction>): R | Action | boolean {
  if (typeof action === 'function') {
    return action(dispatch, getState, {});
  } else if (action.type.endsWith('internal_probeSubscription')) {
    const queryCacheKey = (action as any).payload.queryCacheKey;
    const requestId = (action as any).payload.requestId;
    const hasSubscription = !!internalBatchState.currentSubscriptions[queryCacheKey]?.[requestId];
    return hasSubscription;
  }

  // Middleware dispatch actions before Store starts
  if (service && Object.keys(getState())?.length) {
    Promise.resolve().then(() => {
      delayedActions.map((delayedAction) => service.dispatch(delayedAction));
      delayedActions = [];
      service.dispatch(action);
    });
  } else {
    delayedActions.push(action);
  }

  return action;
}

export function getState(): any {
  return service?.getState();
}

export function select<K>(mapFn: (state: any) => K): Observable<K> {
  return service?.select(mapFn);
}

@Injectable()
export class ThunkService {
  constructor(private readonly store: Store) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    service = this;
  }

  getState = this.store.selectSignal((state) => state);

  dispatch(action: Action): void {
    this.store.dispatch(action);
  }

  select<K>(mapFn: (state: any) => K): Observable<K> {
    return this.store.select(mapFn);
  }
}
