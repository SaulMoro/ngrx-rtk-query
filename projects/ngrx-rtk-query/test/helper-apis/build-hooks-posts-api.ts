import { fetchBaseQuery } from '@rtk-incubator/rtk-query';
import { createApi } from 'ngrx-rtk-query';

export interface Post {
  id: number;
  name: string;
  fetched_at: string;
}

type PostsResponse = Post[];

export const libPostsApi = createApi({
  reducerPath: 'libPostsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://example.com/' }),
  entityTypes: ['Posts'],
  endpoints: (build) => ({
    getPosts: build.query<PostsResponse, void>({
      query: () => ({ url: 'posts' }),
      provides: (result) => [...result.map(({ id }) => ({ type: 'Posts', id } as const))],
    }),
    updatePost: build.mutation<Post, Partial<Post>>({
      query: ({ id, ...body }) => ({
        url: `posts/${id}`,
        method: 'PUT',
        body,
      }),
      invalidates: ({ id }) => [{ type: 'Posts', id }],
    }),
    addPost: build.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: `posts`,
        method: 'POST',
        body,
      }),
      invalidates: ['Posts'],
    }),
  }),
});
