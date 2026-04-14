---
'ngrx-rtk-query': minor
---

Add a Signal Store runtime with `withApi(api)` so RTK Query APIs can be mounted inside NgRx Signal Store hosts and expose generated endpoint `...State()` methods plus `selectApiState(...)` for derived store state, including endpoints injected later on the same API instance.

Share runtime listener setup across store variants, tighten API binding cleanup, and add signal-store example, generated-state test coverage, and e2e coverage.
