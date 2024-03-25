import { createApi, fetchBaseQuery } from 'ngrx-rtk-query';

import { type Post } from './post.model';

export const postsApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'http://api.localhost.com' }),
  tagTypes: ['Posts'],
  endpoints: (build) => ({
    getPosts: build.query<Post[], void>({
      query: () => ({ url: '/posts' }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Posts', id }) as const), { type: 'Posts', id: 'LIST' }]
          : [{ type: 'Posts', id: 'LIST' }],
    }),
    getPost: build.query<Post, number>({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Posts', id }],
    }),
    addPost: build.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: `/posts`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),
    updatePost: build.mutation<Post, Partial<Post>>({
      query: (data) => {
        const { id, ...body } = data;
        return {
          url: `/posts/${id}`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Posts', id }],
    }),
    deletePost: build.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),
  }),
});

export const { useGetPostQuery, useGetPostsQuery, useAddPostMutation, useDeletePostMutation, useUpdatePostMutation } =
  postsApi;
