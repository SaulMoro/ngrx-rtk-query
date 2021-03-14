import { Injectable, Injector } from '@angular/core';
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
  constructor(private readonly injector: Injector) {
    service = this;
  }

  init(): void {
    // Init State context
    getState();
  }

  getState(): any {
    // eslint-disable-next-line rxjs/no-subject-value
    return this._state.getValue();
  }

  dispatch(action: Action): void {
    this._store?.dispatch(action);
  }

  select<K>(mapFn: (state: any) => K): Observable<K> {
    return this._store.select(mapFn);
  }

  private get _store(): Store {
    return this.injector.get(Store);
  }

  private get _state(): State<any> {
    return this.injector.get(State);
  }
}
