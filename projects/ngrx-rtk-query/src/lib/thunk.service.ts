import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import type { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

let service: ThunkService;

export function dispatch(action: Action): Action;
export function dispatch<R>(action: ThunkAction<R, any, any, AnyAction>): R;
export function dispatch<R>(action: Action | ThunkAction<R, any, any, AnyAction>): R | Action {
  if (typeof action === 'function') {
    return action(dispatch, getState, {});
  }
  service?.dispatch(action);
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
    service = this;
  }

  getState(): object {
    let state: object = {};
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
