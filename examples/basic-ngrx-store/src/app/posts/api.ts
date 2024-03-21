import { createApi, fetchBaseQuery, retry } from 'ngrx-rtk-query';

import { type Post } from './post.model';

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: '/',
  /* prepareHeaders: (headers, { getState }) => {
    // By default, if we have a token in the store, let's use that for authenticated requests
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authentication', `Bearer ${token}`);
    }
    return headers;
  },*/
});

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 6 });

export const postsApi = createApi({
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Posts'],
  endpoints: (build) => ({
    getPosts: build.query<Post[], void>({
      query: () => ({ url: 'posts' }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Posts', id }) as const), { type: 'Posts', id: 'LIST' }]
          : [{ type: 'Posts', id: 'LIST' }],
    }),
    getPost: build.query<Post, number>({
      query: (id) => `posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Posts', id }],
    }),
    addPost: build.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: `posts`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),
    updatePost: build.mutation<Post, Partial<Post>>({
      query: (data) => {
        const { id, ...body } = data;
        return {
          url: `posts/${id}`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Posts', id }],
    }),
    deletePost: build.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),
  }),
});

export const { useGetPostQuery, useGetPostsQuery, useAddPostMutation, useDeletePostMutation, useUpdatePostMutation } =
  postsApi;
