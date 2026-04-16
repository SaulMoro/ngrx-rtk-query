---
'ngrx-rtk-query': patch
---

Fix `TS4023` in consumer projects when exporting generated query hooks like `useGetXxxQuery` with declaration emit enabled.

The public `core` entry point now re-exports the `Signal`, `SignalsMap`, and `DeepSignal` helper types used by generated hook signatures so TypeScript can name those exported hook types in consumer `.d.ts` output.

This release also hardens `createApi` teardown so late RTK Query middleware timers can drain after a host store is released without throwing unbound API errors in tests or consumer runtimes.
