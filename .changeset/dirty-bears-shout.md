---
'ngrx-rtk-query': minor
---

Add a Signal Store runtime with `withApi(api)` so RTK Query APIs can be mounted inside NgRx Signal Store hosts and expose `selectApiState(...)` for derived store state.

Share runtime listener setup across store variants, tighten API binding cleanup, and add signal-store example, test, and e2e coverage.
