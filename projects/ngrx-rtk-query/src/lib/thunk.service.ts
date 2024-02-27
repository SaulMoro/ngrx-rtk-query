import { inject, Injectable, Injector, type Signal } from '@angular/core';
import { Store, type Action } from '@ngrx/store';
import type { SelectSignalOptions } from '@ngrx/store/src/models';

let service: ThunkService;
export let injector: Injector;

export function dispatch(action: Action) {
  service?.dispatch(action);
  return action;
}

export function getState() {
  return service?.getState();
}

export function select<K>(mapFn: (state: any) => K, options?: SelectSignalOptions<K>): Signal<K> {
  return service?.select(mapFn, options);
}

@Injectable({ providedIn: 'root' })
export class ThunkService {
  readonly #injector = inject(Injector);
  readonly #store = inject(Store);

  init() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    service = this;
    injector = this.#injector;
  }

  getState = this.#store.selectSignal((state) => state);

  dispatch(action: Action): void {
    this.#store.dispatch(action);
  }

  select<K>(mapFn: (state: any) => K, options?: SelectSignalOptions<K>): Signal<K> {
    return this.#store.selectSignal(mapFn, options);
  }
}
