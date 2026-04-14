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

Mount each api once near the app shell with `withApi(api)`, then compose `withApiState(api)` in the same store or in any other Signal Store that needs to derive view state from the generated `...State()` methods. `withApiState(api)` only requires the same api instance to be mounted by `withApi(api)`, `provideStoreApi(api)`, or `provideNoopStoreApi(api)`.

`withApiState(api)` exposes one generated method per endpoint — for example `getPostsState()` or `addPostState({ fixedCacheKey })` — each returning the same signal as `api.selectSignal(endpoint.select(...))`. They are safe to call directly inside `withComputed(...)` and `withProps(...)`, so stores can expose derived view state without a lazy wrapper.

The generated methods capture the endpoints available when `withApiState(api)` is composed. If the api is later extended with `api.injectEndpoints(...)`, compose `withApiState(extendedApi)` in a new store to pick up the new endpoints.

A reader store that shares a host:

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

A reader store backed by an NgRx Store host. Use `provideStoreApi(api)` to mount the api through `ngrx-rtk-query/store`; the reader Signal Store composes `withApiState(api)` on top of that provider:

```ts
import { provideStoreApi } from 'ngrx-rtk-query/store';

bootstrapApplication(AppComponent, {
  providers: [provideStoreApi(postsApi)],
});

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

A reader store backed by a non-store host. Use `provideNoopStoreApi(api)` to mount the api at the app root without NgRx Store; reader stores composed with `withApiState(api)` can still consume its `...State()` methods:

```ts
import { provideNoopStoreApi } from 'ngrx-rtk-query/noop-store';

bootstrapApplication(AppComponent, {
  providers: [provideNoopStoreApi(postsApi)],
});
```

Rules:

- Each api instance must be bound to a single host store.
- Each `withApi(api)` in the same host store must use a unique `reducerPath`. Duplicates fail fast during store initialization.
- Add `withApiState(api)` only once per api instance in a store.
- Two distinct apis in the same store must not generate the same `...State()` method name.
