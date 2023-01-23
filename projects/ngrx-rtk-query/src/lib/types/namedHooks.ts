import type { EndpointDefinitions, MutationDefinition, QueryDefinition } from '@reduxjs/toolkit/query';
import type { DefinitionType } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import type { UseLazyQuery, UseMutation, UseQuery } from './hooks-types';

export type HooksWithUniqueNames<Definitions extends EndpointDefinitions> = keyof Definitions extends infer Keys
  ? Keys extends string
    ? Definitions[Keys] extends { type: DefinitionType.query }
      ? {
          [K in Keys as `use${Capitalize<K>}Query`]: UseQuery<
            Extract<Definitions[K], QueryDefinition<any, any, any, any>>
          >;
        } & {
          [K in Keys as `useLazy${Capitalize<K>}Query`]: UseLazyQuery<
            Extract<Definitions[K], QueryDefinition<any, any, any, any>>
          >;
        }
      : Definitions[Keys] extends { type: DefinitionType.mutation }
      ? {
          [K in Keys as `use${Capitalize<K>}Mutation`]: UseMutation<
            Extract<Definitions[K], MutationDefinition<any, any, any, any>>
          >;
        }
      : never
    : never
  : never;
