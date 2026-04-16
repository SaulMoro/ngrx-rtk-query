---
'ngrx-rtk-query': patch
---

Fix `TS2527` in consumer projects that use `signalStore(..., withApi(api))` or `withApiState(api)`.

The post-build `.d.ts` patcher now promotes every bundled `declare const X: unique symbol;` to `export declare const X: unique symbol;`, including internal registry keys (`mountedApiRegistryKey`, `apiStateRegistryKey`) that leak through the return types of `withApi` / `withApiState`. A previous filter that only promoted symbols present in grouped value exports skipped these keys and reintroduced the "inaccessible unique symbol" error in consumers.
