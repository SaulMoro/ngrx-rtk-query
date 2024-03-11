import { runInInjectionContext, type Injector } from '@angular/core';
import type { FetchBaseQueryArgs } from '@reduxjs/toolkit/dist/query/fetchBaseQuery';
import { fetchBaseQuery as fetchBaseQueryDefault } from '@reduxjs/toolkit/query';

export type FetchBaseQueryFactory = () => ReturnType<typeof fetchBaseQueryDefault>;

export function fetchBaseQuery(factory: FetchBaseQueryFactory): ReturnType<typeof fetchBaseQueryDefault>;
export function fetchBaseQuery(queryArgs?: FetchBaseQueryArgs): ReturnType<typeof fetchBaseQueryDefault>;
export function fetchBaseQuery(
  paramsOrFactory: FetchBaseQueryArgs | FetchBaseQueryFactory = {},
): ReturnType<typeof fetchBaseQueryDefault> {
  if (typeof paramsOrFactory === 'object') return fetchBaseQueryDefault(paramsOrFactory as FetchBaseQueryArgs);
  return async (args, api, extraOptions) => {
    const injector = (api.extra as any).injector as Injector;
    const baseQuery = runInInjectionContext(injector, paramsOrFactory as FetchBaseQueryFactory);
    return await baseQuery(args, api, extraOptions);
  };
}
