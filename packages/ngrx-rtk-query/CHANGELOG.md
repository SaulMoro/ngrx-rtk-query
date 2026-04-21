# ngrx-rtk-query

## 21.2.3

### Patch Changes

- [#108](https://github.com/SaulMoro/ngrx-rtk-query/pull/108) [`6ba22ba`](https://github.com/SaulMoro/ngrx-rtk-query/commit/6ba22baabc7b7495468d165f5541f74e4e548098) Thanks [@SaulMoro](https://github.com/SaulMoro)! - Allow `resetApiState` to be dispatched after an API store has been released while still preserving the unbound-store error for other actions.

## 21.2.2

### Patch Changes

- [#106](https://github.com/SaulMoro/ngrx-rtk-query/pull/106) [`522d8fa`](https://github.com/SaulMoro/ngrx-rtk-query/commit/522d8fa4f4630d9c657861053289deed6a986e2a) Thanks [@SaulMoro](https://github.com/SaulMoro)! - Fix `TS2527` and `TS2742` in consumer projects with declaration emit enabled.
  - `TS2527` ("inaccessible 'unique symbol' type"): the post-build `.d.ts` patcher now promotes every bundled `declare const X: unique symbol;` to `export declare const X: unique symbol;`, including internal registry keys (`mountedApiRegistryKey`, `apiStateRegistryKey`) that leak through the return types of `withApi` / `withApiState`. A previous filter that only promoted symbols present in grouped value exports skipped these keys and reintroduced the error in consumers using `signalStore(..., withApi(api))` or `withApiState(api)`.
  - `TS2742` ("cannot be named without a reference to '…/ngrx-rtk-query/core' — likely not portable"): the `core` entry point now re-exports every type from `./src/types`, exposing the base `UseQuery`, `UseMutation`, `UseLazyQuery`, `UseInfiniteQuery`, `HooksWithUniqueNames`, etc. that generated hook signatures (`useGetXxxQuery`, `useUpdateXxxMutation`, `apiEndpoints`) refer to. Without these top-level re-exports TypeScript fell back to a deep `.pnpm/…` absolute path.

  The duplicated local `DefinitionType` enum in `core/src/types/hooks-types.ts` is removed in favor of the canonical one from `@reduxjs/toolkit/query` so the wildcard re-export does not clash with `export * from '@reduxjs/toolkit/query'`.

## 21.2.1

### Patch Changes

- [#104](https://github.com/SaulMoro/ngrx-rtk-query/pull/104) [`0432c08`](https://github.com/SaulMoro/ngrx-rtk-query/commit/0432c08e04e8081f2499a362bdf0df34140e4dfe) Thanks [@SaulMoro](https://github.com/SaulMoro)! - Fix `TS4023` in consumer projects when exporting generated query hooks like `useGetXxxQuery` with declaration emit enabled.

  The public `core` entry point now re-exports the `Signal`, `SignalsMap`, and `DeepSignal` helper types used by generated hook signatures so TypeScript can name those exported hook types in consumer `.d.ts` output.

  This release also hardens `createApi` teardown so late RTK Query middleware timers can drain after a host store is released without throwing unbound API errors in tests or consumer runtimes.

## 21.2.0

### Minor Changes

- [#102](https://github.com/SaulMoro/ngrx-rtk-query/pull/102) [`818c3b3`](https://github.com/SaulMoro/ngrx-rtk-query/commit/818c3b30d5cb4538e5f3aa0a448c186631e54441) Thanks [@SaulMoro](https://github.com/SaulMoro)! - Fix `TS2527: The inferred type of '...' references an inaccessible 'unique symbol' type. A type annotation is necessary` in consumer projects when assigning the result of `createApi(...)` (or any value whose type indirectly references one of the library's `unique symbol`s) to an exported binding.

  This release also raises the minimum supported `@ngrx/signals` and `@ngrx/store` version for Angular 21 from `21.0.x` to `21.1.x`, so consumers using the signal-store runtime should upgrade NgRx accordingly.

  The bundled `.d.ts` was emitting `declare const X: unique symbol;` plus a grouped `export { X };` clause at the bottom of the file. TypeScript's declaration emitter cannot reach a `unique symbol` through that grouped re-export, so it failed to serialize the inferred type in consumer code.

  The build now post-processes the bundled `.d.ts` to promote each exported local `declare const X: unique symbol;` to `export declare const X: unique symbol;` (matching how upstream `@reduxjs/toolkit/query/react` ships its symbols) and removes the now-duplicate entries from the grouped export, while leaving internal `unique symbol`s untouched. The fix is enforced via a `prepublishOnly` hook so any `pnpm pub:*` flow always ships a patched `.d.ts`.

## 21.1.0

### Minor Changes

- [#100](https://github.com/SaulMoro/ngrx-rtk-query/pull/100) [`a29839b`](https://github.com/SaulMoro/ngrx-rtk-query/commit/a29839b561b80422b6bc0ec1bc0894f81666c630) Thanks [@SaulMoro](https://github.com/SaulMoro)! - Add `withApiState(api)` to `ngrx-rtk-query/signal-store` so Signal Stores can read generated `...State()` methods from the same store, a child store, or providers like `provideStoreApi(api)` and `provideNoopStoreApi(api)`.

  Keep API mounting in `withApi(api)`, tighten signal-store binding guards, and update the Signal Store docs, tests, and example to show deriving view state from generated readers inside `withComputed(...)` and `withProps(...)`.

## 21.0.0

### Major Changes

- [#96](https://github.com/SaulMoro/ngrx-rtk-query/pull/96) [`797a5d6`](https://github.com/SaulMoro/ngrx-rtk-query/commit/797a5d60856d75cef46b1bab80e75c1898116633) Thanks [@SaulMoro](https://github.com/SaulMoro)! - ### Breaking Changes
  - Updated to Angular 21 and Nx 21
  - Library version now aligned with Angular major version (21.x)

  ### Features
  - **Infinite Queries**: Added `refetchCachedPages` option synced with RTK Query 2.11
    - Allows refetching all cached pages when the cache entry is invalidated
    - Can be set at hook level or per-call basis

  ### Fixes
  - Fixed query state types for `exactOptionalPropertyTypes` TypeScript compatibility

  ### Documentation
  - Added comprehensive AGENTS.md for AI agent guidance
  - Added documentation and examples for infinite queries
  - Improved README with infinite query usage examples

  ### Internal
  - Updated CI workflows to use Node.js 22
  - Updated GitHub Actions versions
  - Refactored code structure for improved readability and maintainability

## 20.0.1

### Patch Changes

- [`f671ec7`](https://github.com/SaulMoro/ngrx-rtk-query/commit/f671ec77cf54f9da9c2912dd2a1dc991928e4587) Thanks [@SaulMoro](https://github.com/SaulMoro)! - ci: fix node-version

- [`43c43a9`](https://github.com/SaulMoro/ngrx-rtk-query/commit/43c43a9587ee20f3366a17bd515d65ec24a37d32) Thanks [@SaulMoro](https://github.com/SaulMoro)! - fix ts issues

## 20.0.0

### Major Changes

- [#93](https://github.com/SaulMoro/ngrx-rtk-query/pull/93) [`147f78e`](https://github.com/SaulMoro/ngrx-rtk-query/commit/147f78e19e70a91f09db726436218c8fb6e8c43f) Thanks [@SaulMoro](https://github.com/SaulMoro)! - Update to angular 20 and toolkit 2.9.0

## 18.2.1

### Patch Changes

- [`22ce986`](https://github.com/SaulMoro/ngrx-rtk-query/commit/22ce986669da373d6c91effb8f45749e468229a3) Thanks [@SaulMoro](https://github.com/SaulMoro)! - fix(lib): add export to infinite queries types

## 18.2.0

### Minor Changes

- [#90](https://github.com/SaulMoro/ngrx-rtk-query/pull/90) [`eedb15a`](https://github.com/SaulMoro/ngrx-rtk-query/commit/eedb15a4bfa4a2b7efae5ac685f5ceac47fb20c4) Thanks [@SaulMoro](https://github.com/SaulMoro)! - Infinite queries

### Patch Changes

- [#90](https://github.com/SaulMoro/ngrx-rtk-query/pull/90) [`8cc9654`](https://github.com/SaulMoro/ngrx-rtk-query/commit/8cc96547cdb7b51c2b493c0a4dfa28826dfc87ab) Thanks [@SaulMoro](https://github.com/SaulMoro)! - fix input required issue

## 18.1.0

### Minor Changes

- [#88](https://github.com/SaulMoro/ngrx-rtk-query/pull/88) [`3f4fd78`](https://github.com/SaulMoro/ngrx-rtk-query/commit/3f4fd78ab6d0758c30f3ac92be14b6e509f25bc7) Thanks [@SaulMoro](https://github.com/SaulMoro)! - Update to RTK 2.5.0.

## 18.0.0

### Major Changes

- [#85](https://github.com/SaulMoro/ngrx-rtk-query/pull/85) [`294bc88`](https://github.com/SaulMoro/ngrx-rtk-query/commit/294bc884b99da0fccec91448003181e8efb56215) Thanks [@SaulMoro](https://github.com/SaulMoro)! - Update to Angular 18 and NgRx 18

## 17.4.6

### Patch Changes

- [#82](https://github.com/SaulMoro/ngrx-rtk-query/pull/82) [`3d61a20`](https://github.com/SaulMoro/ngrx-rtk-query/commit/3d61a20c92fe0408fa5c5770862a2dd9a809bb2a) Thanks [@SaulMoro](https://github.com/SaulMoro)! - Update to RTK 2.2.4

## 17.4.5

### Patch Changes

- [#80](https://github.com/SaulMoro/ngrx-rtk-query/pull/80) [`dbd139f`](https://github.com/SaulMoro/ngrx-rtk-query/commit/dbd139fd1e6eded267822b6b262b26142085632e) Thanks [@SaulMoro](https://github.com/SaulMoro)! - fix: test concurrent in noop store

## 17.4.4

### Patch Changes

- [#78](https://github.com/SaulMoro/ngrx-rtk-query/pull/78) [`bd3e844`](https://github.com/SaulMoro/ngrx-rtk-query/commit/bd3e844b81a10f7477464266c3dc8bb3d52f2a19) Thanks [@SaulMoro](https://github.com/SaulMoro)! - change 'useSelector' to 'selectSignal'

## 17.4.3

### Patch Changes

- [#76](https://github.com/SaulMoro/ngrx-rtk-query/pull/76) [`f8f9656`](https://github.com/SaulMoro/ngrx-rtk-query/commit/f8f96568cfd3dfd9256da2d362c7e52757c4eb66) Thanks [@SaulMoro](https://github.com/SaulMoro)! - add noop store provider

## 17.4.2

### Patch Changes

- [#74](https://github.com/SaulMoro/ngrx-rtk-query/pull/74) [`228bcf7`](https://github.com/SaulMoro/ngrx-rtk-query/commit/228bcf75003a8fe142f09d8a97de4e5d9cda7258) Thanks [@SaulMoro](https://github.com/SaulMoro)! - new repository

- [#74](https://github.com/SaulMoro/ngrx-rtk-query/pull/74) [`73b8a3b`](https://github.com/SaulMoro/ngrx-rtk-query/commit/73b8a3be47763097962bc6e7ed7c075c7cb2cf59) Thanks [@SaulMoro](https://github.com/SaulMoro)! - Update RTK to v2.2.2
