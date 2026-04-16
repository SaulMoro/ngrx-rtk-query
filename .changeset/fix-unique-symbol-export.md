---
'ngrx-rtk-query': minor
---

Fix `TS2527: The inferred type of '...' references an inaccessible 'unique symbol' type. A type annotation is necessary` in consumer projects when assigning the result of `createApi(...)` (or any value whose type indirectly references one of the library's `unique symbol`s) to an exported binding.

This release also raises the minimum supported `@ngrx/signals` and `@ngrx/store` version for Angular 21 from `21.0.x` to `21.1.x`, so consumers using the signal-store runtime should upgrade NgRx accordingly.

The bundled `.d.ts` was emitting `declare const X: unique symbol;` plus a grouped `export { X };` clause at the bottom of the file. TypeScript's declaration emitter cannot reach a `unique symbol` through that grouped re-export, so it failed to serialize the inferred type in consumer code.

The build now post-processes the bundled `.d.ts` to promote each exported local `declare const X: unique symbol;` to `export declare const X: unique symbol;` (matching how upstream `@reduxjs/toolkit/query/react` ships its symbols) and removes the now-duplicate entries from the grouped export, while leaving internal `unique symbol`s untouched. The fix is enforced via a `prepublishOnly` hook so any `pnpm pub:*` flow always ships a patched `.d.ts`.
