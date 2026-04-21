---
'ngrx-rtk-query': patch
---

Allow `resetApiState` to be dispatched even before an API store has been bound so it behaves as a safe no-op cleanup step.
