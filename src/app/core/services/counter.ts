import { fetchBaseQuery } from '@rtk-incubator/rtk-query';
import { createApi } from 'ngrx-rtk-query';

export interface CountResponse {
  count: number;
}

export const counterApi = createApi({
  reducerPath: 'counterApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  entityTypes: ['Counter'],
  endpoints: (build) => ({
    getCount: build.query<CountResponse, void>({
      query: () => ({
        url: `count`,
      }),
      provides: ['Counter'],
    }),
    incrementCount: build.mutation<CountResponse, number>({
      query: (amount) => ({
        url: `increment`,
        method: 'PUT',
        body: { amount },
      }),
      invalidates: ['Counter'],
    }),
    decrementCount: build.mutation<CountResponse, number>({
      query: (amount) => ({
        url: `decrement`,
        method: 'PUT',
        body: { amount },
      }),
      onStart: (amount, { dispatch, context }) => {
        // When we start the request, just immediately update the cache
        context.undoPost = dispatch(
          counterApi.util.updateQueryResult('getCount', undefined, (draft) => {
            Object.assign(draft, { count: draft.count - amount });
          }),
        ).inversePatches;
      },
      onError: (_, { dispatch, context }) => {
        // If there is an error, roll it back
        dispatch(counterApi.util.patchQueryResult('getCount', undefined, context.undoPost));
      },
      invalidates: ['Counter'],
    }),

    getCountById: build.query<CountResponse, string>({
      query: (id: string) => `count/${id}`,
      provides: (_, id) => [{ type: 'Counter', id }],
    }),
    incrementCountById: build.mutation<CountResponse, { id: string; amount: number }>({
      query: ({ id, amount }) => ({
        url: `count/${id}/increment`,
        method: 'PUT',
        body: { amount },
      }),
      invalidates: (_, { id }) => [{ type: 'Counter', id }],
    }),
    decrementCountById: build.mutation<CountResponse, { id: string; amount: number }>({
      query: ({ id, amount }) => ({
        url: `count/${id}/decrement`,
        method: 'PUT',
        body: { amount },
      }),
      invalidates: (_, { id }) => [{ type: 'Counter', id }],
    }),
  }),
});

export const {
  useGetCountQuery,
  useLazyGetCountQuery,
  useIncrementCountMutation,
  useDecrementCountMutation,
  useGetCountByIdQuery,
  useLazyGetCountByIdQuery,
  useIncrementCountByIdMutation,
  useDecrementCountByIdMutation,
  usePrefetch: useCountPrefetch,
  endpoints: counterApiEndpoints,
} = counterApi;
