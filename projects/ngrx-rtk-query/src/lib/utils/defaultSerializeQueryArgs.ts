import { isPlainObject } from '@reduxjs/toolkit';
import { QueryCacheKey } from '@reduxjs/toolkit/dist/query/core/apiState';
import { EndpointDefinition } from '@reduxjs/toolkit/query';

export const defaultSerializeQueryArgs: SerializeQueryArgs<any> = ({ endpointName, queryArgs }) => {
  // Sort the object keys before stringifying, to prevent useQuery({ a: 1, b: 2 })
  // having a different cache key than useQuery({ b: 2, a: 1 })
  return `${endpointName}(${JSON.stringify(queryArgs, (key, value) =>
    isPlainObject(value)
      ? Object.keys(value)
          .sort()
          .reduce<any>((acc, keyAlt) => {
            acc[keyAlt] = (value as any)[keyAlt];
            return acc;
          }, {})
      : value,
  )})`;
};

export type SerializeQueryArgs<QueryArgs, ReturnType = string> = (_: {
  queryArgs: QueryArgs;
  endpointDefinition: EndpointDefinition<any, any, any, any>;
  endpointName: string;
}) => ReturnType;

export type InternalSerializeQueryArgs = (_: {
  queryArgs: any;
  endpointDefinition: EndpointDefinition<any, any, any, any>;
  endpointName: string;
}) => QueryCacheKey;
