# ngrx-rtk-query/signal-store

Signal Store runtime for `ngrx-rtk-query`.

Use `withApi(api)` inside `signalStore(...)` to mount one or more RTK Query APIs in an NgRx Signal Store host.

```ts
import { computed } from '@angular/core';
import { signalStore, withComputed } from '@ngrx/signals';

import { withApi } from 'ngrx-rtk-query/signal-store';

export const PostsStore = signalStore(
  { providedIn: 'root' },
  withApi(postsApi),
  withComputed((store) => {
    const selectedPostsState = store.getPostsState();

    return {
      selectedPostsCount: computed(() => selectedPostsState().data?.length ?? 0),
    };
  }),
);
```

Instantiate the host store once near the app shell, derive view-facing state from generated `...State()` methods or `selectApiState(...)` inside the store, then keep using the generated RTK Query hooks in feature components.

Generated `...State()` methods and `selectApiState(...)` are safe to call directly inside `withComputed(...)` and `withProps(...)`, so the store can expose derived view state without a lazy wrapper.

The host store exposes one generated method per endpoint, such as `getPostsState()` or `addPostState({ fixedCacheKey })`, plus `selectApiState(...)` for generic access. Both return the same signal as `api.selectSignal(endpoint.select(...))`.

Generated `...State()` methods are created from the endpoints that exist when `withApi(api)` is added to the host store. If the same API instance injects more endpoints later with `api.injectEndpoints(...)`, select those lazy endpoints through `selectApiState(injectedApi.endpoints.foo, ...)`.

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
- Query and infinite-query selection uses `endpoint + arg`.
- Mutation selection uses `endpoint + { fixedCacheKey }`.
