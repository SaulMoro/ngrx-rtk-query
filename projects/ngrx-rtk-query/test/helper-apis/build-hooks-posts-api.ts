import { createApi, fetchBaseQuery } from 'ngrx-rtk-query';

export interface Post {
  id: number;
  name: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  fetched_at: string;
}

type PostsResponse = Post[];

export const libPostsApi = createApi({
  reducerPath: 'libPostsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://example.com/' }),
  tagTypes: ['Posts'],
  endpoints: (build) => ({
    getPosts: build.query<PostsResponse, void>({
      query: () => ({ url: 'posts' }),
      providesTags: (result) => (result ? [...result.map(({ id }) => ({ type: 'Posts', id } as const))] : []),
    }),
    updatePost: build.mutation<Post, Partial<Post>>({
      query: ({ id, ...body }) => ({
        url: `posts/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Posts', id }],
    }),
    addPost: build.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: `posts`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Posts'],
    }),
  }),
});
