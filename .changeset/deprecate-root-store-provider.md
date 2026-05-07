---
'ngrx-rtk-query': minor
---

Deprecate importing `provideStoreApi` from the root entrypoint.

Import `provideStoreApi` from `ngrx-rtk-query/store` instead. Core APIs such as `createApi` and `fetchBaseQuery` remain available from `ngrx-rtk-query`. Signal Store runtime features remain available from `ngrx-rtk-query/signal-store`.

This prepares a future major version where the root entrypoint will no longer re-export the NgRx Store provider.
