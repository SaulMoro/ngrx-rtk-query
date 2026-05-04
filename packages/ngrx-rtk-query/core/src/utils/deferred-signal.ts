import { type Signal, effect, signal, untracked } from '@angular/core';

type SignalInput<T> = T | Signal<T> | (() => T);

function isSignalInput<T>(value: SignalInput<T>): value is Signal<T> | (() => T) {
  return typeof value === 'function';
}

export function readSignal<T>(value: SignalInput<T>): T;
export function readSignal<T>(value: SignalInput<T>, options: { initialValue: T }): () => T;
export function readSignal<T>(value: SignalInput<T>, options?: { initialValue: T }): T | (() => T) {
  if (!options) {
    return isSignalInput(value) ? value() : value;
  }

  return isSignalInput(value) ? toDeferredSignal(value, options) : () => value;
}

function toDeferredSignal<T>(inputSignal: Signal<T> | (() => T), { initialValue }: { initialValue: T }): Signal<T> {
  const s = signal<T>(initialValue as T);

  effect(() => {
    const input = inputSignal();
    untracked(() => s.set(input));
  });

  return s.asReadonly();
}
