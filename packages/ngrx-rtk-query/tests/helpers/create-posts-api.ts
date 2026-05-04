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
      getPost: build.query<Post, number>({
        queryFn: async (id) => ({
          data: { id, name: `${reducerPath}-post-${id}` },
        }),
      }),
      addPost: build.mutation<Post, { name: string }>({
        queryFn: async ({ name }) => ({
          data: { id: 1, name },
        }),
      }),
    }),
  });

export const createDeferredPostsApi = (reducerPath: string) => {
  const deferred: { resolvePosts?: (posts: Post[]) => void } = {};
  const posts = new Promise<Post[]>((resolve) => {
    deferred.resolvePosts = resolve;
  });
  const resolvePosts = (nextPosts: Post[]) => {
    if (!deferred.resolvePosts) throw new Error('Deferred posts resolver was not initialized.');
    deferred.resolvePosts(nextPosts);
  };

  const postsApi = createApi({
    reducerPath,
    baseQuery: fakeBaseQuery(),
    endpoints: (build) => ({
      getPosts: build.query<Post[], void>({
        queryFn: async () => ({
          data: await posts,
        }),
      }),
    }),
  });

  return { postsApi, resolvePosts };
};
