# Testing

This document owns test strategy for the library, examples, and public runtime contracts.

## Test Surfaces

| Surface                         | Default check                                               | Purpose                                       |
| ------------------------------- | ----------------------------------------------------------- | --------------------------------------------- |
| `packages/ngrx-rtk-query/tests` | `pnpm nx run ngrx-rtk-query:test`                           | Library public behavior and runtime contracts |
| `examples/basic-ngrx-store`     | `pnpm nx run basic-ngrx-store:test`                         | NgRx Store consumer usage                     |
| `examples/basic-noop-store`     | `pnpm nx run basic-noop-store:test`                         | Noop Store consumer usage                     |
| `examples/basic-signal-store`   | `pnpm nx run basic-signal-store:test`                       | Signal Store consumer usage                   |
| `examples/*-e2e`                | `pnpm affected:e2e` or targeted `pnpm nx run <project>:e2e` | Browser tracer bullets for example apps       |

Use `pnpm affected:test` for normal affected test coverage and `pnpm verify:full` before broader integration or public-contract handoff.

## Authoring Rules

- Prefer Vitest for library and example unit tests.
- Prefer Testing Library for Angular component tests.
- Test through public entrypoints and generated APIs.
- Write regression tests for behavior changes before implementation when practical.
- Keep tests semantic. Avoid assertions on private helper structure unless the helper is itself the public surface.
- Keep E2E tests as tracer bullets for runtime wiring and critical browser behavior, not exhaustive permutations.

## Runtime Matrix

Runtime-sensitive changes must consider all implemented hosts:

- NgRx Store: `provideStoreApi(api)`.
- Noop Store: `provideNoopStoreApi(api)`.
- Signal Store host: `withApi(api)`.
- Signal Store reader: `withApiState(api)` backed by any mounted host.

When changing hook lifecycle, cache state, listener setup, mutation state, or Signal Store readers, run the relevant library tests and at least one consumer-style example check for the affected runtime.

## MSW And Examples

Examples use MSW to provide deterministic API behavior in development and tests. Keep example mocks production-shaped enough to prove consumer usage, but do not make examples the only assertion for library behavior. Library contracts belong in package tests.

## Browser Validation

Use browser validation when a change affects example rendering, routing, or user interaction. Prefer targeted E2E or browser automation over manual inspection when the expected result can be asserted.
