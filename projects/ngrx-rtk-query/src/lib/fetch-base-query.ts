import { runInInjectionContext } from '@angular/core';
import type { FetchBaseQueryArgs } from '@reduxjs/toolkit/dist/query/fetchBaseQuery';
import { fetchBaseQuery as fetchBaseQueryDefault } from '@reduxjs/toolkit/query';
import { injector } from './thunk.service';

export type FetchBaseQueryFactory = () => ReturnType<typeof fetchBaseQueryDefault>;

export function fetchBaseQuery(factory: FetchBaseQueryFactory): ReturnType<typeof fetchBaseQueryDefault>;
export function fetchBaseQuery(queryArgs?: FetchBaseQueryArgs): ReturnType<typeof fetchBaseQueryDefault>;
export function fetchBaseQuery(
  paramsOrFactory: FetchBaseQueryArgs | FetchBaseQueryFactory = {},
): ReturnType<typeof fetchBaseQueryDefault> {
  if (typeof paramsOrFactory === 'object') return fetchBaseQueryDefault(paramsOrFactory as FetchBaseQueryArgs);
  return async (args, api, extraOptions) => {
    const baseQuery = runInInjectionContext(injector, paramsOrFactory as FetchBaseQueryFactory);
    return await baseQuery(args, api, extraOptions);
  };
}
