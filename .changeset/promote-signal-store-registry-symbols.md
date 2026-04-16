---
'ngrx-rtk-query': patch
---

Fix `TS2527` and `TS2742` in consumer projects with declaration emit enabled.

- `TS2527` ("inaccessible 'unique symbol' type"): the post-build `.d.ts` patcher now promotes every bundled `declare const X: unique symbol;` to `export declare const X: unique symbol;`, including internal registry keys (`mountedApiRegistryKey`, `apiStateRegistryKey`) that leak through the return types of `withApi` / `withApiState`. A previous filter that only promoted symbols present in grouped value exports skipped these keys and reintroduced the error in consumers using `signalStore(..., withApi(api))` or `withApiState(api)`.
- `TS2742` ("cannot be named without a reference to '…/ngrx-rtk-query/core' — likely not portable"): the `core` entry point now re-exports every type from `./src/types`, exposing the base `UseQuery`, `UseMutation`, `UseLazyQuery`, `UseInfiniteQuery`, `HooksWithUniqueNames`, etc. that generated hook signatures (`useGetXxxQuery`, `useUpdateXxxMutation`, `apiEndpoints`) refer to. Without these top-level re-exports TypeScript fell back to a deep `.pnpm/…` absolute path.

The duplicated local `DefinitionType` enum in `core/src/types/hooks-types.ts` is removed in favor of the canonical one from `@reduxjs/toolkit/query` so the wildcard re-export does not clash with `export * from '@reduxjs/toolkit/query'`.
