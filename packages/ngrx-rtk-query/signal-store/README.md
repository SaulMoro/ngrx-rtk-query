# ngrx-rtk-query/signal-store

Signal Store features for `ngrx-rtk-query`.

Use `withApi(api)` to mount an RTK Query API in an NgRx Signal Store host, and `withApiState(api)` to expose typed `...State()` reader methods.

```ts
import { computed } from '@angular/core';
import { signalStore, withComputed, withProps } from '@ngrx/signals';

import { withApi, withApiState } from 'ngrx-rtk-query/signal-store';

export const PostsStore = signalStore(
  { providedIn: 'root' },
  withApi(postsApi),
  withApiState(postsApi),
  withProps((store) => ({
    selectedPostsState: store.getPostsState(),
  })),
  withComputed(({ selectedPostsState }) => ({
    selectedPostsCount: computed(() => selectedPostsState().data?.length ?? 0),
  })),
);
```

Instantiate the host store once near the app shell with `withApi(api)`, then compose `withApiState(api)` in the same signal store or in another signal store to derive view-facing state from generated `...State()` methods.
`withApiState(api)` does not require `withApi(api)` in the same store. It only requires the same api instance to already be mounted by an active host, whether that host comes from `withApi(api)`, `provideStoreApi(api)`, or `provideNoopStoreApi(api)`.

Generated `...State()` methods are safe to call directly inside `withComputed(...)` and `withProps(...)`, so the store can expose derived view state without a lazy wrapper.

`withApiState(api)` exposes one generated method per endpoint, such as `getPostsState()` or `addPostState({ fixedCacheKey })`. Each one reads the same state as `api.selectSignal(endpoint.select(...))`.

Generated `...State()` methods are created from the endpoints that exist when `withApiState(api)` is added to the store. If the same API instance injects more endpoints later with `api.injectEndpoints(...)`, create a new store with `withApiState(extendedApi)` after the injection step.

`withApiState(api)` works with the same API instance mounted by `withApi(api)`, `provideStoreApi(api)`, or `provideNoopStoreApi(api)`.

```ts
export const ParentStore = signalStore({ providedIn: 'root' }, withApi(postsApi));

export const PostsReaderStore = signalStore(
  { providedIn: 'root' },
  withApiState(postsApi),
  withProps((store) => ({
    selectedPostsState: store.getPostsState(),
  })),
  withComputed(({ selectedPostsState }) => ({
    selectedPostsCount: computed(() => selectedPostsState().data?.length ?? 0),
  })),
);
```

```ts
export class PostsListComponent {
  readonly postsStore = inject(PostsStore);
  readonly postsQuery = useGetPostsQuery();
}
```

Rules:

- One `api` instance can only be bound to one host store.
- Each `withApi(api)` in the same host store must use a unique `reducerPath`.
- Duplicate `reducerPath` values fail fast during store initialization.
- Add `withApiState(api)` only once per api instance in a store.
- Two distinct apis in the same store must not generate the same `...State()` method name.
