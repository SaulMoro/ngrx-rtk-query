# ngrx-rtk-query/core

Store-agnostic secondary entrypoint for the public library.

## Public Surface

- `createApi` wraps RTK Query's API creation with Angular hook generation.
- `fetchBaseQuery` provides the default fetch-based base query and the Angular DI factory overload.
- Generated hook types and core utilities used by the public runtime entrypoints.
- RTK Query exports re-exposed by the package surface, such as `skipToken`, when available from the core API.

`ɵ`-prefixed exports are internal runtime plumbing for sibling entrypoints. They are not user-facing API.

## Dependency Boundary

`core` must not require `@ngrx/store` or `@ngrx/signals`. Keep store-specific runtime wiring in `store`, `noop-store`, or `signal-store`.

Use this entrypoint when an application does not install `@ngrx/store` and wants to avoid resolving the deprecated root `provideStoreApi` export.

## Validation

Core behavior is primarily covered by `packages/ngrx-rtk-query/tests`. Runtime-sensitive changes should also run the affected host tests listed in `docs/TESTING.md`.
