import { EndpointDefinitions, MutationDefinition, QueryDefinition } from '@rtk-incubator/rtk-query';
import { DefinitionType } from '@rtk-incubator/rtk-query/dist/esm/ts/endpointDefinitions';
import { UseLazyQuery, UseMutation, UseQuery } from './hooks-types';

export type TS41Hooks<Definitions extends EndpointDefinitions> = keyof Definitions extends infer Keys
  ? Keys extends string
    ? Definitions[Keys] extends { type: DefinitionType.query }
      ? {
          [K in Keys as `use${Capitalize<K>}Query`]: UseQuery<
            Extract<Definitions[K], QueryDefinition<any, any, any, any>>
          >;
        } &
          {
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
