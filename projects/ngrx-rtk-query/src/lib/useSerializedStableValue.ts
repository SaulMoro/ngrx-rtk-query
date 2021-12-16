import { EndpointDefinition } from '@reduxjs/toolkit/query';
import { SerializeQueryArgs } from '@reduxjs/toolkit/dist/query/defaultSerializeQueryArgs';

export function useStableQueryArgs<T>(
  queryArgs: T,
  serialize: SerializeQueryArgs<any>,
  endpointDefinition: EndpointDefinition<any, any, any, any>,
  endpointName: string,
  cacheRef: { current?: any } = {},
) {
  const incoming = {
    queryArgs,
    serialized: typeof queryArgs == 'object' ? serialize({ queryArgs, endpointDefinition, endpointName }) : queryArgs,
  };

  if (!cacheRef.current || cacheRef.current.serialized !== incoming.serialized) {
    cacheRef.current = incoming;
  }

  return cacheRef.current.queryArgs;
}
