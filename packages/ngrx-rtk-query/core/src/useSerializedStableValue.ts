import { type Signal, computed, effect } from '@angular/core';
import { copyWithStructuralSharing } from '@reduxjs/toolkit/query';

export function useStableQueryArgs<T>(queryArgs: Signal<T>) {
  const cache: { current: T | undefined } = { current: queryArgs() };
  const copy = computed(() => {
    const incomingArgs = queryArgs();
    return copyWithStructuralSharing(cache.current, incomingArgs);
  });

  effect(() => {
    const copyValue = copy();
    if (cache.current !== copyValue) {
      cache.current = copyValue;
    }
  });

  return copy;
}
