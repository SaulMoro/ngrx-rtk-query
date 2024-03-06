/**
 * The code in this file is adapted from ngrx/signals
 *
 * ngrx is an open-source project licensed under the MIT license.
 *
 * For more information about the original code, see
 * https://github.com/ngrx/platform
 */
import { computed, isSignal, Signal as NgSignal, untracked } from '@angular/core';
import { IsKnownRecord } from './tsHelpers';

// An extended Signal type that enables the correct typing
// of nested signals with the `name` or `length` key.
export interface Signal<T> extends NgSignal<T> {
  name: unknown;
  length: unknown;
}

export type SignalsMap<T> = Readonly<
  Required<{
    [K in keyof T]: IsKnownRecord<T[K]> extends true ? DeepSignal<T[K]> : Signal<T[K]>;
  }>
>;

export type DeepSignal<T> = Signal<T> & SignalsMap<T>;

export function toDeepSignal<T>(signal: Signal<T>): DeepSignal<T> {
  const value = untracked(() => signal());
  if (!isRecord(value)) {
    return signal as DeepSignal<T>;
  }

  return new Proxy(signal, {
    get(target: any, prop) {
      if (!(prop in value)) {
        return target[prop];
      }

      if (!isSignal(target[prop])) {
        Object.defineProperty(target, prop, {
          value: computed(() => target()[prop]),
          configurable: true,
        });
      }

      return toDeepSignal(target[prop]);
    },
  });
}

export function toSignalsMap<TInput extends Record<string | symbol, any>>(inputSignal: Signal<TInput>) {
  const internalState = {} as SignalsMap<TInput>;

  return new Proxy<SignalsMap<TInput>>(internalState, {
    get(target, prop) {
      // first check if we have it in our internal state and return it
      const computedField = target[prop];
      if (computedField) return computedField;

      // then, check if it's a function on the resultState and return it
      const targetField = untracked(inputSignal)[prop];
      if (typeof targetField === 'function') return targetField;

      // finally, create a computed field, store it and return it
      // @ts-expect-error bypass
      return (target[prop] = computed(() => inputSignal()[prop]));
    },
    has(_, prop) {
      return !!untracked(inputSignal)[prop];
    },
    ownKeys() {
      return Reflect.ownKeys(untracked(inputSignal));
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      };
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value?.constructor === Object;
}
