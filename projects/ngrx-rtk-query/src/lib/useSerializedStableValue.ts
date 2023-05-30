import { Signal, computed, effect } from '@angular/core';
import type { SerializeQueryArgs } from '@reduxjs/toolkit/dist/query/defaultSerializeQueryArgs';
import type { EndpointDefinition } from '@reduxjs/toolkit/dist/query/endpointDefinitions';

export function useStableQueryArgs<T>(
  queryArgs: Signal<T>,
  serialize: SerializeQueryArgs<any>,
  endpointDefinition: EndpointDefinition<any, any, any, any>,
  endpointName: string,
) {
  const incoming = computed(() => {
    const incomingArgs = queryArgs();
    return {
      queryArgs: incomingArgs,
      serialized:
        typeof incomingArgs == 'object'
          ? serialize({ queryArgs: incomingArgs, endpointDefinition, endpointName })
          : incomingArgs,
    };
  });
  let cache = incoming();
  effect(() => {
    if (cache.serialized !== incoming().serialized) {
      cache = incoming();
    }
  });

  return computed(() => (cache.serialized === incoming().serialized ? cache.queryArgs : queryArgs()));
}
