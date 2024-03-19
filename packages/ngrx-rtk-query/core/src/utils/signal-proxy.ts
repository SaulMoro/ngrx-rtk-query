/**
 * The code in this file is adapted from TanStack/query
 *
 * TanStack/query is an open-source project licensed under the MIT license.
 *
 * For more information about the original code, see
 * https://github.com/TanStack/query
 */
import { type Signal as NgSignal, computed, untracked } from '@angular/core';

// An extended Signal type that enables the correct typing
// of nested signals with the `name` or `length` key.
export interface Signal<T> extends NgSignal<T> {
  name: unknown;
  length: unknown;
}

export type SignalsMap<T> = Required<{
  [K in keyof T]: T[K] extends Function ? T[K] : Signal<T[K]>;
}>;

export type DeepSignal<T> = Signal<T> & SignalsMap<T>;

/**
 * Exposes fields of an object passed via an Angular `Signal` as `Computed` signals.
 *
 * Functions on the object are passed through as-is.
 *
 * @param signal - `Signal` that must return an object.
 *
 */
export function signalProxy<T extends Record<string | symbol, any>>(signal: Signal<T>): SignalsMap<T> {
  const internalState = {} as SignalsMap<T>;

  return new Proxy<SignalsMap<T>>(internalState, {
    get(target, prop) {
      // first check if we have it in our internal state and return it
      const computedField = target[prop];
      if (computedField) return computedField;

      // then, check if it's a function on the resultState and return it
      const targetField = untracked(signal)[prop];
      if (typeof targetField === 'function') return targetField;

      // finally, create a computed field, store it and return it
      // @ts-expect-error bypass
      return (target[prop] = computed(() => signal()[prop]));
    },
    has(_, prop) {
      return !!untracked(signal)[prop];
    },
    ownKeys() {
      return Reflect.ownKeys(untracked(signal));
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      };
    },
  });
}

export function toDeepSignal<T extends Record<string | symbol, any>>(signal: Signal<T>): DeepSignal<T> {
  const deepSignal = signalProxy(signal);
  return Object.assign(signal, deepSignal);
}
