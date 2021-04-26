import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { createApi } from 'ngrx-rtk-query';
import { waitMs } from '../helper';

// Just setup a temporary in-memory counter for tests that `getIncrementedAmount`.
// This can be used to test how many renders happen due to data changes or
// the refetching behavior of components.
let amount = 0;

export const resetAmount = () => (amount = 0);

export const api = createApi({
  baseQuery: async (arg: any) => {
    await waitMs();
    if (arg?.body && 'amount' in arg.body) {
      amount += 1;
    }

    if (arg?.body && 'forceError' in arg.body) {
      return {
        error: {
          status: 500,
          data: null,
        },
      };
    }

    return { data: arg?.body ? { ...arg.body, ...(amount ? { amount } : {}) } : undefined };
  },
  endpoints: (build) => ({
    getUser: build.query<any, number>({
      query: (arg) => arg,
    }),
    getIncrementedAmount: build.query<any, void>({
      query: () => ({
        url: '',
        body: {
          amount,
        },
      }),
    }),
    updateUser: build.mutation<{ name: string }, { name: string }>({
      query: (update) => ({ body: update }),
    }),
    getError: build.query({
      query: (query) => '/error',
    }),
  }),
});

export const defaultApi = createApi({
  reducerPath: 'defaultApi',
  baseQuery: async (arg: any) => {
    await waitMs();
    if ('amount' in arg?.body) {
      amount += 1;
    }
    return { data: arg?.body ? { ...arg.body, ...(amount ? { amount } : {}) } : undefined };
  },
  endpoints: (build) => ({
    getIncrementedAmount: build.query<any, void>({
      query: () => ({
        url: '',
        body: {
          amount,
        },
      }),
    }),
  }),
  refetchOnMountOrArgChange: true,
});

export const mutationApi = createApi({
  reducerPath: 'mutationApi',
  baseQuery: async (arg: any) => {
    await waitMs();
    if ('amount' in arg?.body) {
      amount += 1;
    }
    return { data: arg?.body ? { ...arg.body, ...(amount ? { amount } : {}) } : undefined };
  },
  endpoints: (build) => ({
    increment: build.mutation<{ amount: number }, number>({
      query: (incrementAmount) => ({
        url: '',
        method: 'POST',
        body: {
          amount: incrementAmount,
        },
      }),
    }),
  }),
});

export const invalidationsApi = createApi({
  reducerPath: 'invalidationsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
  tagTypes: ['User'],
  endpoints: (build) => ({
    checkSession: build.query<any, void>({
      query: () => '/me',
      providesTags: ['User'],
    }),
    login: build.mutation<any, any>({
      query: () => ({ url: '/login', method: 'POST' }),
      invalidatesTags: ['User'],
    }),
  }),
});
