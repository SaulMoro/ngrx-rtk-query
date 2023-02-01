import type { FetchBaseQueryArgs } from '@reduxjs/toolkit/dist/query/fetchBaseQuery';
import { fetchBaseQuery as fetchBaseQueryDefault } from '@reduxjs/toolkit/query';
import { currentConfig } from './store-rtk-query.config';

/**
 * This is a very small wrapper around fetch that aims to simplify requests.
 *
 * @example
 * ```ts
 * const baseQuery = fetchBaseQuery({
 *   baseUrl: 'https://api.your-really-great-app.com/v1/',
 *   prepareHeaders: (headers, { getState }) => {
 *     const token = (getState() as RootState).auth.token;
 *     // If we have a token set in state, let's assume that we should be passing it.
 *     if (token) {
 *       headers.set('authorization', `Bearer ${token}`);
 *     }
 *     return headers;
 *   },
 * })
 * ```
 *
 * @param baseUrl
 * The base URL for an API service.
 * Typically in the format of https://example.com/
 *
 * @param prepareHeaders
 * An optional function that can be used to inject headers on requests.
 * Provides a Headers object, as well as most of the `BaseQueryApi` (`dispatch` is not available).
 * Useful for setting authentication or headers that need to be set conditionally.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Headers
 *
 * @param fetchFn
 * Accepts a custom `fetch` function if you do not want to use the default on the window.
 * Useful in SSR environments if you need to use a library such as `isomorphic-fetch` or `cross-fetch`
 *
 * @param paramsSerializer
 * An optional function that can be used to stringify querystring parameters.
 *
 * @param isJsonContentType
 * An optional predicate function to determine if `JSON.stringify()` should be called on the `body` arg of `FetchArgs`
 *
 * @param jsonContentType Used when automatically setting the content-type header for a request with a jsonifiable
 * body that does not have an explicit content-type header. Defaults to `application/json`.
 *
 * @param jsonReplacer Custom replacer function used when calling `JSON.stringify()`.
 *
 * @param timeout
 * A number in milliseconds that represents the maximum time a request can take before timing out.
 */
export function fetchBaseQuery(queryArgs: FetchBaseQueryArgs = {}): ReturnType<typeof fetchBaseQueryDefault> {
  const baseQueryEnvironment = fetchBaseQueryDefault(queryArgs);

  return async (args, api, extraOptions) => {
    const baseUrl = currentConfig?.baseUrl ?? '';
    const argUrl = typeof args === 'string' ? args : args.url;
    const url = `${baseUrl}${argUrl}`;
    const newArgs = typeof args === 'string' ? url : { ...args, url };
    return await baseQueryEnvironment(newArgs, api, extraOptions);
  };
}
