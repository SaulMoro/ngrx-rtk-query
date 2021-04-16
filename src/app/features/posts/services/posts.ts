import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { fetchBaseQuery, retry } from '@rtk-incubator/rtk-query';
import { createApi } from 'ngrx-rtk-query';
import { Post } from '../models';

type PostsResponse = Post[];

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
  reducerPath: 'postsApi',
  baseQuery: baseQueryWithRetry,
  entityTypes: ['Posts'],
  endpoints: (build) => ({
    getPosts: build.query<PostsResponse, void>({
      query: () => ({ url: 'posts' }),
      provides: (result) =>
        result ? [...result.map(({ id }) => ({ type: 'Posts', id } as const)), { type: 'Posts', id: 'LIST' }] : [],
    }),
    addPost: build.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: `posts`,
        method: 'POST',
        body,
      }),
      invalidates: [{ type: 'Posts', id: 'LIST' }],
    }),
    getPost: build.query<Post, number>({
      query: (id) => `posts/${id}`,
      provides: (_, error, id) => [{ type: 'Posts', id }],
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
      invalidates: (_, error, { id }) => [{ type: 'Posts', id }],
    }),
    deletePost: build.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `posts/${id}`,
        method: 'DELETE',
      }),
      invalidates: (_, error, id) => [{ type: 'Posts', id }],
    }),
  }),
});

export const {
  useAddPostMutation,
  useDeletePostMutation,
  useGetPostQuery,
  useGetPostsQuery,
  useUpdatePostMutation,
} = postsApi;

@NgModule({
  imports: [StoreModule.forFeature(postsApi.reducerPath, postsApi.reducer, { metaReducers: [postsApi.metareducer] })],
})
export class PostsQueryModule {}
