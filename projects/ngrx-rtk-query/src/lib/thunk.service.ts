import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import type { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

let service: ThunkService;
let delayedActions: Action[] = [];

export function dispatch(action: Action): Action;
export function dispatch<R>(action: ThunkAction<R, any, any, AnyAction>): R;
export function dispatch<R>(action: Action | ThunkAction<R, any, any, AnyAction>): R | Action;
export function dispatch<R>(action: Action | ThunkAction<R, any, any, AnyAction>): R | Action | boolean {
  if (typeof action === 'function') {
    return action(dispatch, getState, {});
  } else if (action.type.endsWith('internal_probeSubscription')) {
    service.dispatch(action);
    return true;
  }

  // Middleware dispatch actions before Store starts
  if (service && Object.keys(getState())?.length) {
    delayedActions.map((delayedAction) => service.dispatch(delayedAction));
    delayedActions = [];
    service.dispatch(action);
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

  getState(): object {
    let state: object = {};
    // eslint-disable-next-line ngrx/no-store-subscription
    this.store.pipe(take(1)).subscribe((res) => (state = res));
    return state;
  }

  dispatch(action: Action): void {
    this.store?.dispatch(action);
  }

  select<K>(mapFn: (state: any) => K): Observable<K> {
    return this.store.select(mapFn);
  }
}
