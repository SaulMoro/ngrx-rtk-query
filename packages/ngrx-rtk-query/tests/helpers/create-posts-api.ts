import { createApi, fakeBaseQuery } from 'ngrx-rtk-query/core';

export type Post = {
  id: number;
  name: string;
};

export const createDeferred = <T>(label: string) => {
  let resolveValue: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolveValue = resolve;
  });

  const resolve = (value: T) => {
    if (!resolveValue) throw new Error(`${label} resolver was not initialized.`);
    resolveValue(value);
  };

  return { promise, resolve };
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

export const createCountingPostApi = (reducerPath: string) => {
  let fetchCount = 0;

  const postsApi = createApi({
    reducerPath,
    baseQuery: fakeBaseQuery(),
    endpoints: (build) => ({
      getPost: build.query<Post, number>({
        queryFn: async (id) => {
          fetchCount += 1;
          return {
            data: { id, name: `${reducerPath}-post-${fetchCount}` },
          };
        },
      }),
    }),
  });

  return { postsApi, getFetchCount: () => fetchCount };
};

export const createOptionalPostApi = (reducerPath: string) =>
  createApi({
    reducerPath,
    baseQuery: fakeBaseQuery(),
    endpoints: (build) => ({
      getOptionalPost: build.query<Post, undefined>({
        queryFn: async (arg) => ({
          data: { id: 1, name: arg === undefined ? `${reducerPath}-undefined-arg` : `${reducerPath}-unexpected-arg` },
        }),
      }),
    }),
  });

export const createFailingPostApi = (reducerPath: string) =>
  createApi({
    reducerPath,
    baseQuery: fakeBaseQuery(),
    endpoints: (build) => ({
      getPost: build.query<Post, number>({
        queryFn: async () => ({
          error: {
            status: 500,
            data: `${reducerPath} failed`,
          },
        }),
      }),
    }),
  });

export const createFailingPostsApi = (reducerPath: string) =>
  createApi({
    reducerPath,
    baseQuery: fakeBaseQuery(),
    endpoints: (build) => ({
      getPosts: build.query<Post[], void>({
        queryFn: async () => ({
          error: {
            status: 500,
            data: `${reducerPath} failed`,
          },
        }),
      }),
    }),
  });

export const createDeferredPostsApi = (reducerPath: string) => {
  const deferredPosts = createDeferred<Post[]>('Deferred posts');

  const postsApi = createApi({
    reducerPath,
    baseQuery: fakeBaseQuery(),
    endpoints: (build) => ({
      getPosts: build.query<Post[], void>({
        queryFn: async () => ({
          data: await deferredPosts.promise,
        }),
      }),
    }),
  });

  return { postsApi, resolvePosts: deferredPosts.resolve };
};
