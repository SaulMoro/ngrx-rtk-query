import { Injectable, Injector, Signal, inject } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import { InternalMiddlewareState } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types';

let service: ThunkService;
export let injector: Injector;
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

  if (service && Object.keys(getState())?.length) {
    service.dispatch(action);
  } else {
    delayedActions.push(action);
  }

  return action;
}

export function getState() {
  return service?.getState();
}

export function select<K>(mapFn: (state: any) => K): Signal<K> {
  return service?.select(mapFn);
}

@Injectable({ providedIn: 'root' })
export class ThunkService {
  readonly #injector = inject(Injector);
  readonly #store = inject(Store);

  init() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    service = this;
    injector = this.#injector;
    delayedActions.forEach((delayedAction) => this.dispatch(delayedAction));
    delayedActions = [];
  }

  getState = this.#store.selectSignal((state) => state);

  dispatch(action: Action): void {
    this.#store.dispatch(action);
  }

  select<K>(mapFn: (state: any) => K): Signal<K> {
    return this.#store.selectSignal(mapFn);
  }
}
