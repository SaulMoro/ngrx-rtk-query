import {
  BaseQueryFn,
  EndpointDefinitions,
  Api,
  Module,
  QueryDefinition,
  MutationDefinition,
  buildCreateApi,
  coreModule,
} from '@rtk-incubator/rtk-query';
import { MetaReducer } from '@ngrx/store';

import { buildHooks } from './build-hooks';
import { buildMetaReducer } from './build-metareducer';
import { dispatch, getState as getStateFromStore, select } from './thunk.service';
import { QueryHooks, MutationHooks, isQueryDefinition, isMutationDefinition, TS41Hooks } from './types';
import { capitalize, safeAssign } from './utils';

export const angularHooksModuleName = Symbol();
export type AngularHooksModule = typeof angularHooksModuleName;

/* eslint-disable @typescript-eslint/no-unused-vars */
declare module '@rtk-incubator/rtk-query' {
  export interface ApiModules<
    BaseQuery extends BaseQueryFn,
    Definitions extends EndpointDefinitions,
    ReducerPath extends string,
    EntityTypes extends string
  > {
    [angularHooksModuleName]: {
      endpoints: {
        [K in keyof Definitions]: Definitions[K] extends QueryDefinition<any, any, any, any, any>
          ? QueryHooks<Definitions[K]>
          : Definitions[K] extends MutationDefinition<any, any, any, any, any>
          ? MutationHooks<Definitions[K]>
          : never;
      };
    } & TS41Hooks<Definitions> & { metareducer: MetaReducer<any> };
  }
}

export interface AngularHooksModuleOptions {
  useDispatch?: typeof dispatch;
  getState?: typeof getStateFromStore;
  useSelector?: typeof select;
}

export const angularHooksModule = ({
  useDispatch = dispatch,
  useSelector = select,
  getState = getStateFromStore,
}: AngularHooksModuleOptions = {}): Module<AngularHooksModule> => ({
  name: angularHooksModuleName,
  init(api, options, context) {
    const { buildQueryHooks, buildMutationHook, usePrefetch } = buildHooks({
      api,
      moduleOptions: { useDispatch, useSelector, getState },
    });
    const metareducer = buildMetaReducer({ api, moduleOptions: { useDispatch, getState } });
    safeAssign(api, { usePrefetch, metareducer });

    return {
      injectEndpoint(endpointName, definition) {
        const anyApi = (api as any) as Api<any, Record<string, any>, string, string, AngularHooksModule>;

        if (isQueryDefinition(definition)) {
          const { useQuery, useQueryState, useQuerySubscription } = buildQueryHooks(endpointName);
          safeAssign(anyApi.endpoints[endpointName], {
            useQuery,
            useQueryState,
            useQuerySubscription,
          });
          (api as any)[`use${capitalize(endpointName)}Query`] = useQuery;
        } else if (isMutationDefinition(definition)) {
          const useMutation = buildMutationHook(endpointName);
          safeAssign(anyApi.endpoints[endpointName], {
            useMutation,
          });
          (api as any)[`use${capitalize(endpointName)}Mutation`] = useMutation;
        }
      },
    };
  },
});

export const createApi = buildCreateApi(coreModule(), angularHooksModule());
