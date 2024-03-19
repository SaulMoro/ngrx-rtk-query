import { type Signal, computed } from '@angular/core';
import { type EndpointDefinition, type SerializeQueryArgs } from '@reduxjs/toolkit/query';

export function useStableQueryArgs<T>(
  queryArgs: Signal<T>,
  serialize: SerializeQueryArgs<any>,
  endpointDefinition: EndpointDefinition<any, any, any, any>,
  endpointName: string,
) {
  const incoming = computed(
    () => {
      const incomingArgs = queryArgs();
      return {
        queryArgs: incomingArgs,
        serialized:
          typeof incomingArgs == 'object'
            ? serialize({ queryArgs: incomingArgs, endpointDefinition, endpointName })
            : incomingArgs,
      };
    },
    { equal: (a, b) => a.serialized === b.serialized },
  );
  return computed(() => incoming().queryArgs);
}
