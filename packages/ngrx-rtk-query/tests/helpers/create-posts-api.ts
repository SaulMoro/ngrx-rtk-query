import { createApi, fakeBaseQuery } from 'ngrx-rtk-query/core';

export type Post = {
  id: number;
  name: string;
};

export const createPostsApi = (reducerPath: string) =>
  createApi({
    reducerPath,
    baseQuery: fakeBaseQuery(),
    endpoints: (build) => ({
      getPosts: build.query<Post[], void>({
        queryFn: async () => ({
          data: [{ id: 1, name: `${reducerPath}-post` }],
        }),
      }),
      addPost: build.mutation<Post, { name: string }>({
        queryFn: async ({ name }) => ({
          data: { id: 1, name },
        }),
      }),
    }),
  });
