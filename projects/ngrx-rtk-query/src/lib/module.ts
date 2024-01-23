import { isDevMode } from '@angular/core';
import { createSelectorFactory, defaultMemoize, type Action } from '@ngrx/store';
import type { ThunkAction } from '@reduxjs/toolkit';
import type {
  Api,
  BaseQueryFn,
  EndpointDefinitions,
  Module,
  MutationDefinition,
  PrefetchOptions,
  QueryArgFrom,
  QueryDefinition,
  QueryKeys,
} from '@reduxjs/toolkit/query';

import { buildHooks } from './build-hooks';
import { dispatch as _dispatch, getState as _getState, select } from './thunk.service';
import {
  isMutationDefinition,
  isQueryDefinition,
  type HooksWithUniqueNames,
  type MutationHooks,
  type QueryHooks,
} from './types';
import { capitalize, safeAssign, shallowEqual } from './utils';

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
       * A hook that provides access to the store's api dispatch function.
       */
      dispatch: Dispatch;
    } & HooksWithUniqueNames<Definitions>;
  }
}

const _createSelector = createSelectorFactory((projector) => defaultMemoize(projector, shallowEqual, shallowEqual));

export interface AngularHooksModuleOptions {
  /**
   * The hooks from Redux to be used
   */
  hooks?: {
    /**
     * The version of the `dispatch` to be used
     */
    dispatch: Dispatch;
    /**
     * The version of the `getState` to be used
     */
    getState: typeof _getState;
    /**
     * The version of the `useSelector` hook to be used
     */
    useSelector: typeof select;
  };
  /**
   * A selector creator (usually from `reselect`, or matching the same signature)
   */
  createSelector?: typeof _createSelector;
}

/**
 * Creates a module that generates angular hooks from endpoints, for use with `buildCreateApi`.
 *
 *  @example
 * ```ts
 * const customCreateApi = buildCreateApi(
 *   coreModule(),
 *   angularHooksModule({
 *     hooks: {
 *       useDispatch: createDispatchHook(MyContext),
 *       useSelector: createSelectorHook(MyContext),
 *       useStore: createStoreHook(MyContext)
 *     }
 *   })
 * );
 * ```
 *
 * @returns A module for use with `buildCreateApi`
 */
export const angularHooksModule = ({
  hooks = {
    dispatch: _dispatch as Dispatch,
    useSelector: select,
    getState: _getState,
  },
  createSelector = _createSelector,
  ...rest
}: AngularHooksModuleOptions = {}): Module<AngularHooksModule> => {
  if (isDevMode()) {
    const hookNames = ['dispatch', 'useSelector', 'getState'] as const;
    let warned = false;
    for (const hookName of hookNames) {
      // warn for old hook options
      if (Object.keys(rest).length > 0) {
        if ((rest as Partial<typeof hooks>)[hookName]) {
          if (!warned) {
            console.warn(
              'As of RTK 2.0, the hooks now need to be specified as one object, provided under a `hooks` key:' +
                '\n`angularHooksModule({ hooks: { dispatch, useSelector, getState } })`',
            );
            warned = true;
          }
        }
        // @ts-expect-error migrate
        hooks[hookName] = rest[hookName];
      }
      // then make sure we have them all
      if (typeof hooks[hookName] !== 'function') {
        throw new Error(
          `When using custom hooks for context, all ${hookNames.length} hooks need to be provided: ${hookNames.join(
            ', ',
          )}.\nHook ${hookName} was either not provided or not a function.`,
        );
      }
    }
  }

  return {
    name: angularHooksModuleName,
    init(api, { serializeQueryArgs }, context) {
      const anyApi = api as any as Api<any, Record<string, any>, string, string, AngularHooksModule>;
      const { buildQueryHooks, buildMutationHook, usePrefetch } = buildHooks({
        api,
        moduleOptions: { hooks, createSelector },
        serializeQueryArgs,
        context,
      });
      safeAssign(anyApi, { usePrefetch });
      safeAssign(anyApi, { dispatch: hooks.dispatch });

      return {
        injectEndpoint(endpointName, definition) {
          if (isQueryDefinition(definition)) {
            const { useQuery, useLazyQuery, useLazyQuerySubscription, useQueryState, useQuerySubscription, selector } =
              buildQueryHooks(endpointName);
            safeAssign(anyApi.endpoints[endpointName], {
              useQuery,
              useLazyQuery,
              useLazyQuerySubscription,
              useQueryState,
              useQuerySubscription,
              selector,
            });
            (api as any)[`use${capitalize(endpointName)}Query`] = useQuery;
            (api as any)[`useLazy${capitalize(endpointName)}Query`] = useLazyQuery;
          } else if (isMutationDefinition(definition)) {
            const { useMutation, selector } = buildMutationHook(endpointName);
            safeAssign(anyApi.endpoints[endpointName], { useMutation, selector });
            (api as any)[`use${capitalize(endpointName)}Mutation`] = useMutation;
          }
        },
      };
    },
  };
};
