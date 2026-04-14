---
'ngrx-rtk-query': minor
---

Add `withApiState(api)` to `ngrx-rtk-query/signal-store` so Signal Stores can read generated `...State()` methods from the same store, a child store, or providers like `provideStoreApi(api)` and `provideNoopStoreApi(api)`.

Keep API mounting in `withApi(api)`, tighten signal-store binding guards, and update the Signal Store docs, tests, and example to show deriving view state from generated readers inside `withComputed(...)` and `withProps(...)`.
