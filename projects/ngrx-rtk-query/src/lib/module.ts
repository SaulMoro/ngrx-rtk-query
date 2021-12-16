import { buildCreateApi, coreModule } from '@reduxjs/toolkit/query';
import type {
  BaseQueryFn,
  EndpointDefinitions,
  QueryDefinition,
  MutationDefinition,
  Api,
  Module,
} from '@reduxjs/toolkit/query';
import type { QueryKeys } from '@reduxjs/toolkit/dist/query/core/apiState';
import type { PrefetchOptions } from '@reduxjs/toolkit/dist/query/core/module';
import { QueryArgFrom } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import type { MetaReducer } from '@ngrx/store';

import { buildHooks } from './build-hooks';
import { buildMetaReducer } from './build-metareducer';
import { dispatch, getState as getStateFromStore, select } from './thunk.service';
import { QueryHooks, MutationHooks, HooksWithUniqueNames, isQueryDefinition, isMutationDefinition } from './types';
import { capitalize, safeAssign } from './utils';

export const angularHooksModuleName = /* @__PURE__ */ Symbol();
export type AngularHooksModule = typeof angularHooksModuleName;

declare module '@reduxjs/toolkit/query' {
  export interface ApiModules<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BaseQuery extends BaseQueryFn,
    Definitions extends EndpointDefinitions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ReducerPath extends string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TagTypes extends string,
  > {
    [angularHooksModuleName]: {
      /**
       *  Endpoints based on the input endpoints provided to `createApi`, containing `select`, `hooks` and `action matchers`.
       */
      endpoints: {
        [K in keyof Definitions]: Definitions[K] extends QueryDefinition<any, any, any, any, any>
          ? QueryHooks<Definitions[K]>
          : Definitions[K] extends MutationDefinition<any, any, any, any, any>
          ? MutationHooks<Definitions[K]>
          : never;
      };
      /**
       * A hook that accepts a string endpoint name, and provides a callback that when called,
       * pre-fetches the data for that endpoint.
       */
      usePrefetch<EndpointName extends QueryKeys<Definitions>>(
        endpointName: EndpointName,
        options?: PrefetchOptions,
      ): (arg: QueryArgFrom<Definitions[EndpointName]>, options?: PrefetchOptions) => void;
    } & HooksWithUniqueNames<Definitions> & { metareducer: MetaReducer<any> };
  }
}

export interface AngularHooksModuleOptions {
  /**
   * The version of the `useDispatch` hook to be used
   */
  useDispatch?: typeof dispatch;
  /**
   * The version of the `getState` to be used
   */
  getState?: typeof getStateFromStore;
  /**
   * The version of the `useSelector` hook to be used
   */
  useSelector?: typeof select;
}

/**
 * Creates a module that generates hooks from endpoints, for use with `buildCreateApi`.
 *
 * @returns A module for use with `buildCreateApi`
 */
export const angularHooksModule = ({
  useDispatch = dispatch,
  useSelector = select,
  getState = getStateFromStore,
}: AngularHooksModuleOptions = {}): Module<AngularHooksModule> => ({
  name: angularHooksModuleName,
  init(api, { serializeQueryArgs }, context) {
    const anyApi = api as any as Api<any, Record<string, any>, string, string, AngularHooksModule>;
    const { buildQueryHooks, buildMutationHook, usePrefetch } = buildHooks({
      api,
      moduleOptions: { useDispatch, useSelector, getState },
      serializeQueryArgs,
      context,
    });
    const metareducer: MetaReducer<any> = buildMetaReducer({ api, moduleOptions: { useDispatch } });
    safeAssign(anyApi, { usePrefetch });
    safeAssign(anyApi, { metareducer });

    return {
      injectEndpoint(endpointName, definition) {
        if (isQueryDefinition(definition)) {
          const { useQuery, useLazyQuery, useLazyQuerySubscription, useQueryState, useQuerySubscription } =
            buildQueryHooks(endpointName);
          safeAssign(anyApi.endpoints[endpointName], {
            useQuery,
            useLazyQuery,
            useLazyQuerySubscription,
            useQueryState,
            useQuerySubscription,
          });
          (api as any)[`use${capitalize(endpointName)}Query`] = useQuery;
          (api as any)[`useLazy${capitalize(endpointName)}Query`] = useLazyQuery;
        } else if (isMutationDefinition(definition)) {
          const useMutation = buildMutationHook(endpointName);
          safeAssign(anyApi.endpoints[endpointName], { useMutation });
          (api as any)[`use${capitalize(endpointName)}Mutation`] = useMutation;
        }
      },
    };
  },
});

export const createApi = /* @__PURE__ */ buildCreateApi(coreModule(), angularHooksModule());
