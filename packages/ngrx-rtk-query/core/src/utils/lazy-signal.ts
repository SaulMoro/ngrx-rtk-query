import { type Signal, effect, signal, untracked } from '@angular/core';

export function toLazySignal<T>(inputSignal: Signal<T> | (() => T), { initialValue }: { initialValue: T }): Signal<T> {
  const s = signal<T>(initialValue as T);

  effect(() => {
    const input = inputSignal();
    untracked(() => s.set(input));
  });

  return s.asReadonly();
}
