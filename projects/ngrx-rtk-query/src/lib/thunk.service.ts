import { Injectable } from '@angular/core';
import { Action, State, Store } from '@ngrx/store';
import { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import { Observable } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class ThunkService {
  constructor(private readonly store: Store, private readonly state: State<any>) {
    service = this;
  }

  getState(): any {
    // eslint-disable-next-line rxjs/no-subject-value
    return this.state.getValue();
  }

  dispatch(action: Action): void {
    this.store?.dispatch(action);
  }

  select<K>(mapFn: (state: any) => K): Observable<K> {
    return this.store.select(mapFn);
  }
}
