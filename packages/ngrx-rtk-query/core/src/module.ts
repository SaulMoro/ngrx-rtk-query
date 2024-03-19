import { type Injector, type Signal, type ValueEqualityFn } from '@angular/core';
import { type Action, type Selector, type ThunkAction } from '@reduxjs/toolkit';
import {
  type Api,
  type BaseQueryFn,
  type EndpointDefinitions,
  type Module,
  type MutationDefinition,
  type PrefetchOptions,
  type QueryArgFrom,
  type QueryDefinition,
  type QueryKeys,
} from '@reduxjs/toolkit/query';

import { buildHooks } from './build-hooks';
import {
  type HooksWithUniqueNames,
  type MutationHooks,
  type QueryHooks,
  isMutationDefinition,
  isQueryDefinition,
} from './types';
import { capitalize, safeAssign } from './utils';

export const angularHooksModuleName = /* @__PURE__ */ Symbol();
export type AngularHooksModule = typeof angularHooksModuleName;

export type Dispatch = <ReturnType>(
  action: Action | ThunkAction<ReturnType, any, any, Action>,
) => ReturnType extends Action ? Action : ReturnType;

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
      /**
       * Provides access to the api dispatch function.
       */
      dispatch: Dispatch;
      /**
       * Provides access to the api injector.
       */
      getInjector: () => Injector;
    } & HooksWithUniqueNames<Definitions>;
  }
}

export interface AngularHooksModuleOptions {
  /**
   * The hooks from Redux to be used
   */
  hooks: {
    /**
     * The version of the `dispatch` to be used
     */
    dispatch: Dispatch;
    /**
     * The version of the `getState` to be used
     */
    getState: () => any;
    /**
     * The version of the `useSelector` hook to be used
     */
    useSelector: <K>(mapFn: (state: any) => K, options?: { equal?: ValueEqualityFn<K> }) => Signal<K>;
  };
  /**
   * A selector creator (usually from `reselect`, or matching the same signature)
   */
  createSelector: <T = any, V = any>(...input: any[]) => Selector<T, V>;
  /**
   * The injector to be used
   */
  getInjector: () => Injector;
}

/**
 * Creates a module that generates angular hooks from endpoints, for use with `buildCreateApi`.
 *
 *  @example
 * ```ts
 * const customCreateApi = buildCreateApi(
 *   coreModule(),
 *   angularHooksModule(() => myCreateAngularHooksModule())
 * );
 * ```
 *
 * @returns A module for use with `buildCreateApi`
 */
export const angularHooksModule = ({
  hooks,
  createSelector,
  getInjector,
}: AngularHooksModuleOptions): Module<AngularHooksModule> => {
  return {
    name: angularHooksModuleName,
    init(api, { serializeQueryArgs }, context) {
      const anyApi = api as any as Api<any, Record<string, any>, any, any, AngularHooksModule>;
      const { buildQueryHooks, buildMutationHook, usePrefetch } = buildHooks({
        api,
        moduleOptions: { hooks, createSelector, getInjector },
        serializeQueryArgs,
        context,
      });
      safeAssign(anyApi, { usePrefetch });
      safeAssign(anyApi, { dispatch: hooks.dispatch });
      safeAssign(anyApi, { getInjector });

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
            const { useMutation } = buildMutationHook(endpointName);
            safeAssign(anyApi.endpoints[endpointName], { useMutation });
            (api as any)[`use${capitalize(endpointName)}Mutation`] = useMutation;
          }
        },
      };
    },
  };
};
