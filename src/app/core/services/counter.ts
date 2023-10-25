import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { createApi, fetchBaseQuery } from 'ngrx-rtk-query';

export interface CountResponse {
  count: number;
}

export const counterApi = createApi({
  reducerPath: 'counterApi',
  // Example of overriding the default fetchBaseQuery with injectable services
  baseQuery: fetchBaseQuery((store = inject(Store)) => {
    console.log('store', store);
    return fetchBaseQuery({ baseUrl: '/' });
  }),
  tagTypes: ['Counter'],
  endpoints: (build) => ({
    getCount: build.query<CountResponse, void>({
      query: () => ({
        url: `count`,
      }),
      providesTags: ['Counter'],
    }),
    incrementCount: build.mutation<CountResponse, number>({
      query: (amount) => ({
        url: `increment`,
        method: 'PUT',
        body: { amount },
      }),
      invalidatesTags: ['Counter'],
    }),
    decrementCount: build.mutation<CountResponse, number>({
      query: (amount) => ({
        url: `decrement`,
        method: 'PUT',
        body: { amount },
      }),
      invalidatesTags: ['Counter'],
      onQueryStarted: (amount, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          counterApi.util.updateQueryData('getCount', undefined, (draft) => {
            Object.assign(draft, { count: draft.count - amount });
          }),
        );
        queryFulfilled.catch(patchResult.undo);
      },
    }),

    getCountById: build.query<CountResponse, string>({
      query: (id: string) => `count/${id}`,
      providesTags: (result, error, id) => [{ type: 'Counter', id }],
    }),
    incrementCountById: build.mutation<CountResponse, { id: string; amount: number }>({
      query: ({ id, amount }) => ({
        url: `count/${id}/increment`,
        method: 'PUT',
        body: { amount },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Counter', id }],
    }),
    decrementCountById: build.mutation<CountResponse, { id: string; amount: number }>({
      query: ({ id, amount }) => ({
        url: `count/${id}/decrement`,
        method: 'PUT',
        body: { amount },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Counter', id }],
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
