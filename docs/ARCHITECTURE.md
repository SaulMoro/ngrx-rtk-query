# Architecture

This document records the durable architecture of the library workspace. Public usage examples live in `packages/ngrx-rtk-query/README.md`; active implementation plans live in `docs/specs/`.

## Workspace Shape

- `packages/ngrx-rtk-query` is the public Angular library.
- `packages/ngrx-rtk-query/core` is the store-agnostic secondary entrypoint.
- `packages/ngrx-rtk-query/store` integrates RTK Query with NgRx Store.
- `packages/ngrx-rtk-query/noop-store` provides the non-NgRx runtime host.
- `packages/ngrx-rtk-query/signal-store` integrates RTK Query state readers with NgRx Signal Store.
- `examples/basic-ngrx-store` validates the NgRx Store runtime.
- `examples/basic-noop-store` validates the Noop Store runtime.
- `examples/basic-signal-store` validates the Signal Store feature runtime.
- `examples/*-e2e` hold Playwright tracer bullets for each example runtime.

## Public Entrypoints

| Entrypoint                    | Responsibility                                                                          | Peer/runtime expectation                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `ngrx-rtk-query`              | Root convenience entrypoint for core APIs and the deprecated root store provider export | Core APIs plus compatibility during the root store-provider deprecation window |
| `ngrx-rtk-query/core`         | Store-agnostic `createApi`, `fetchBaseQuery`, generated hook types, and utilities       | Does not require `@ngrx/store`                                                 |
| `ngrx-rtk-query/store`        | `provideStoreApi(api)` for apps that use NgRx Store                                     | Requires `@ngrx/store` and an app-level `provideStore()`                       |
| `ngrx-rtk-query/noop-store`   | `provideNoopStoreApi(api)` for apps that do not use NgRx Store                          | Does not require `@ngrx/store`                                                 |
| `ngrx-rtk-query/signal-store` | `withApi(api)` and `withApiState(api)` for NgRx Signal Store                            | Requires `@ngrx/signals`                                                       |

Do not add public exports casually. A public export is a package contract and must be documented, tested through the public surface, and considered for a changeset.

## Runtime Host Model

Each API instance must be mounted by exactly one runtime host:

- `provideStoreApi(api)` mounts the API in an NgRx Store application.
- `provideNoopStoreApi(api)` mounts the API without NgRx Store.
- `withApi(api)` mounts the API in an NgRx Signal Store host.

Reader APIs may be composed separately:

- `withApiState(api)` exposes generated `...State()` methods in Signal Stores.
- `withApiState(api)` requires the same API instance to be mounted somewhere in the app by `withApi(api)`, `provideStoreApi(api)`, or `provideNoopStoreApi(api)`.
- A reader store does not need to be the host store.

## Hook Model

Generated hooks mirror RTK Query React hook semantics while adapting state access to Angular signals:

- `useXxxQuery` subscribes declaratively and accepts static values, signals, or functions for args and options.
- `useLazyXxxQuery` returns a trigger object with query state signals and lazy-query helpers.
- `useXxxMutation` returns a trigger object with mutation state signals.
- `useXxxInfiniteQuery` exposes infinite-query page state and pagination helpers.
- Fine-grained signal access such as `query.isLoading()` is preferred over reading the whole signal when a template or computed only needs one field.

## Code Splitting

Use RTK Query `api.injectEndpoints(...)` for endpoints that share the same base API. Compose hooks and `withApiState(...)` from the extended API when consumers need the newly injected endpoints.

Create a separate API instance only when the feature needs a different base API, cache identity, or runtime host. Each separate API instance must still be mounted once.

## Boundary Rules

- Parse external inputs at boundaries. Keep internal state typed.
- Test public behavior through published entrypoints and generated APIs, not private implementation helpers.
- Keep store-specific code out of `core`.
- Keep Signal Store feature code under `signal-store`.
- Keep example-app code as consumer-style usage. Do not rely on package internals from examples.
- Preserve upstream RTK Query behavior unless an Angular-specific adaptation is intentional and documented.
- When syncing RTK Query React hooks, inspect `buildHooks.ts`, `module.ts`, and hook types together.
