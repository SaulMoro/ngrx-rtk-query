# Plan: Signal Store Runtime for RTK Query

Parent Spec: [2026-04-13-signal-store-runtime-spec.md](/Users/pw-smoro/Repositorios/ngrx-rtk-query/docs/specs/2026-04-13-signal-store-runtime-spec.md)

## Source Register

- **Canonical source:** `docs/specs/2026-04-13-signal-store-runtime-spec.md`
- **Canonical source commit:** `15d5313` (`docs: add signal-store runtime spec`)
- **Source anchors:**
  - `Problem Statement`
  - `Solution`
  - `User Stories`
  - `Implementation Decisions`
  - `Decision Log`
  - `Invariants`
  - `Failure Model`
  - `Compatibility / Migration / Rollout`
  - `Testing Decisions`
  - `Technical Acceptance Criteria`
  - `Validation Notes`
  - `Out of Scope`
- **Durable decisions extracted from source:**
  - Signal Store support is added through `withApi(api, { setupListeners? })` in a secondary `signal-store` entry point.
  - RTK Query state remains isolated from host domain state.
  - Multiple APIs are allowed per host store only when `reducerPath` values are unique.
  - Duplicate `reducerPath`, unregistered endpoint selection, and invalid mutation selection identity fail explicitly.
  - `store.selectApiState(...)` is the only host-store helper added by the feature and remains equivalent to `api.selectSignal(endpoint.select(...))`.
  - Mutation selection is public only through `fixedCacheKey`, not `requestId`.
  - `@ngrx/signals` remains an optional peer dependency.
  - The runtime must ship with main README coverage, entrypoint README coverage, and a full example variant.
- **Material amendments after spec lock:** none
- **Inherited assumptions:** none required; all slicing-critical behavior is already present in the spec

## Slice Set

| #   | ID        | Title                                    | Role             | Mode | Irrev. | Uncert. | Blocked by                      |
| --- | --------- | ---------------------------------------- | ---------------- | ---- | ------ | ------- | ------------------------------- |
| 1   | `SIG-001` | Single-API Signal Store Runtime          | Walking Skeleton | AFK  | High   | Low     | None                            |
| 2   | `SIG-002` | Query/Infinite Selector Bridge           | Vertical Slice   | AFK  | High   | Low     | `SIG-001`                       |
| 3   | `SIG-003` | Multi-API Registry and Duplicate Guard   | Vertical Slice   | AFK  | High   | Low     | `SIG-001`                       |
| 4   | `SIG-004` | Mutation Selector Contract               | Vertical Slice   | AFK  | High   | Low     | `SIG-001`, `SIG-002`            |
| 5   | `SIG-005` | Public Parity, Docs, and Example Surface | Vertical Slice   | AFK  | Low    | Low     | `SIG-001`, `SIG-002`, `SIG-004` |

## Dependency DAG

- `SIG-001 -> SIG-002`
  - **Why blocked:** the selector bridge depends on a working Signal Store runtime and host-store registration path.
  - **Readiness check:** a single API can be registered with `withApi(...)`, and one example query completes successfully through the new runtime.
- `SIG-001 -> SIG-003`
  - **Why blocked:** multi-API registry and duplicate-key validation depend on the base runtime contract and state isolation already existing.
  - **Readiness check:** single-API runtime is green and RTK Query state is not exposed as host domain state.
- `SIG-001 -> SIG-004`
  - **Why blocked:** mutation selection depends on the base runtime and mutation state being readable from the host store at all.
  - **Readiness check:** base runtime is registered and a mutation flow can execute through the Signal Store variant.
- `SIG-002 -> SIG-004`
  - **Why blocked:** mutation selection extends the same host-store selector bridge contract and should not redefine it independently.
  - **Readiness check:** query/infinite `store.selectApiState(...)` is already equivalent to `api.selectSignal(...)`.
- `SIG-001 -> SIG-005`
  - **Why blocked:** documentation and release-facing example parity must describe a real runtime, not a provisional stub.
  - **Readiness check:** the basic runtime contract is implemented and stable enough to document.
- `SIG-002 -> SIG-005`
  - **Why blocked:** the example app must visibly demonstrate `store.selectApiState(...)`, which depends on the query/infinite selector bridge.
  - **Readiness check:** the selector bridge exists and can drive visible derived state in the example app.
- `SIG-004 -> SIG-005`
  - **Why blocked:** release-facing parity includes the full supported runtime contract, including mutation-selection behavior and its explicit failure model.
  - **Readiness check:** mutation selector behavior is implemented and documented enough to publish as supported.

## Coverage Matrix

| Source item                                             | Slice IDs                       | Coverage disposition                                             |
| ------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| User Stories 1-4                                        | `SIG-001`                       | Covered by one slice                                             |
| User Stories 5-6                                        | `SIG-003`                       | Covered by one slice                                             |
| User Stories 8-10, 13, 17                               | `SIG-002`                       | Covered by one slice                                             |
| User Stories 11-12                                      | `SIG-004`                       | Covered by one slice                                             |
| User Stories 14-16, 19                                  | `SIG-005`                       | Covered by one slice                                             |
| User Story 18                                           | `SIG-002`, `SIG-003`, `SIG-004` | Intentionally split across named sibling slices by guard family  |
| User Story 20                                           | `SIG-003`                       | Covered by one slice                                             |
| Decision: secondary entry point + feature contract      | `SIG-001`, `SIG-005`            | Intentionally split between runtime and public rollout surface   |
| Decision: isolated RTK Query state                      | `SIG-001`                       | Covered by one slice                                             |
| Decision: single host helper `selectApiState(...)`      | `SIG-002`, `SIG-004`            | Intentionally split between query/infinite and mutation families |
| Decision: multi-API with unique `reducerPath`           | `SIG-003`                       | Covered by one slice                                             |
| Decision: mutation via `fixedCacheKey`, not `requestId` | `SIG-004`                       | Covered by one slice                                             |
| Failure Model: duplicate `reducerPath` registration     | `SIG-003`                       | Covered by one slice                                             |
| Failure Model: unregistered endpoint selection          | `SIG-002`                       | Covered by one slice                                             |
| Failure Model: invalid mutation selection identity      | `SIG-004`                       | Covered by one slice                                             |
| Validation: direct runtime guard coverage               | `SIG-002`, `SIG-003`, `SIG-004` | Intentionally split across named sibling slices by guard family  |
| Validation: visible example behavior and e2e parity     | `SIG-005`                       | Covered by one slice                                             |
| Out of Scope items                                      | none                            | Explicitly not sliced                                            |

## Findings Log

1. `optional` `applied`
   - **Finding:** Separate multi-API registry/duplicate-key validation from mutation selector identity.
   - **Disposition:** applied
   - **Why:** they require different demo evidence, different failure semantics, and different validation targets.
2. `optional` `applied`
   - **Finding:** Keep release-facing docs and example parity in a final slice instead of bloating the walking skeleton.
   - **Disposition:** applied
   - **Why:** this preserves a thin end-to-end proof first and avoids coupling public rollout polish to runtime feasibility.
3. `critical`
   - none

## Materialization State

`materialized`

The slices below are materialized into this plan file rather than GitHub issues.

---

## `SIG-001` Single-API Signal Store Runtime

Parent Spec: [2026-04-13-signal-store-runtime-spec.md](/Users/pw-smoro/Repositorios/ngrx-rtk-query/docs/specs/2026-04-13-signal-store-runtime-spec.md)

## What to build

Create the thinnest end-to-end Signal Store runtime path that proves `withApi(api, { setupListeners? })` works as a real third runtime. This slice establishes single-API registration, generated-hook execution, runtime state isolation, and the baseline example variant needed to prove the integration exists outside documentation.

**Role:** Walking Skeleton
**Execution mode:** AFK
**Irreversibility:** High -- introduces the durable public runtime contract for Signal Store
**Uncertainty:** Low
**Demoable happy path:** A developer starts the Signal Store example, a generated query runs through `withApi(...)`, and the screen reaches a successful loaded state through the new runtime.

## Blocked by

None -- can start immediately.

## User stories addressed

From the parent spec:

- User story 1
- User story 2
- User story 3
- User story 4
- User story 16
- User story 19

## Acceptance criteria

Covered from the parent spec:

- `withApi(api, { setupListeners? })` is the Signal Store runtime contract
- single-API runtime support exists through the `signal-store` entry point
- RTK Query state remains isolated from host domain state
- the example matrix gains a real Signal Store variant

Done for this slice when:

- [ ] A host `signalStore(...)` can register one RTK Query API through `withApi(...)`.
- [ ] Generated RTK Query hooks run successfully through the Signal Store runtime for at least one end-to-end query happy path.
- [ ] The `setupListeners` option shape is accepted with the same public semantics as the existing runtimes.
- [ ] The runtime does not expose RTK Query cache state as host-domain-owned public state.
- [ ] A runnable Signal Store example variant exists and proves the single-query happy path.

## Included states

- `loading`: the example visibly reflects the initial in-flight query state
- `success`: the example visibly renders loaded data through the Signal Store runtime

## Exclusions

- `store.selectApiState(...)` selector bridge behavior -- covered by `SIG-002`
- multi-API registration and duplicate-key failure behavior -- covered by `SIG-003`
- mutation selection contract -- covered by `SIG-004`
- release-facing docs and parity polish -- covered by `SIG-005`

## Architectural decisions

- **Runtime shape:** expose Signal Store support as `withApi(api, { setupListeners? })` in a secondary `signal-store` entry point
- **State ownership:** keep RTK Query state isolated from host domain state
- **Compatibility:** existing store and noop-store runtimes remain additive-only impacts

---

## `SIG-002` Query/Infinite Selector Bridge

Parent Spec: [2026-04-13-signal-store-runtime-spec.md](/Users/pw-smoro/Repositorios/ngrx-rtk-query/docs/specs/2026-04-13-signal-store-runtime-spec.md)

## What to build

Add the host-store selector bridge for query and infinite-query endpoints through `store.selectApiState(...)`, keeping it behaviorally equivalent to `api.selectSignal(endpoint.select(...))`. Prove it end-to-end with one visible derived-state use in the Signal Store example and one explicit failure path for selecting an endpoint whose API is not registered in the host store.

**Role:** Vertical Slice
**Execution mode:** AFK
**Irreversibility:** High -- extends the durable public runtime surface on the host store
**Uncertainty:** Low
**Demoable happy path:** A developer derives query state from the host store with `store.selectApiState(...)` and sees the UI reflect the selected state without introducing a new hook family.

## Blocked by

- `SIG-001` -- the selector bridge depends on the base runtime existing; verify the Signal Store example can already load one query successfully.

## User stories addressed

From the parent spec:

- User story 8
- User story 9
- User story 10
- User story 13
- User story 17
- User story 18 (unregistered endpoint guard portion)

## Acceptance criteria

Covered from the parent spec:

- `store.selectApiState(...)` remains equivalent to `api.selectSignal(...)`
- query and infinite-query families select concrete cache entries by endpoint plus argument
- unregistered endpoint selection fails explicitly
- the example visibly demonstrates derived state through the host store helper

Done for this slice when:

- [ ] `store.selectApiState(...)` can select query endpoint state by endpoint plus argument.
- [ ] `store.selectApiState(...)` can select infinite-query endpoint state by endpoint plus argument.
- [ ] The returned signal remains behaviorally equivalent to selecting the same endpoint state through `api.selectSignal(...)`.
- [ ] Selecting an endpoint whose API is not registered in the host store throws an explicit, actionable error.
- [ ] The Signal Store example visibly uses `store.selectApiState(...)` for a derived state path.

## Included states

- `loading`: derived state can observe an in-flight query
- `success`: derived state can observe loaded data
- `empty` or `error`: the selected query state remains readable when those states occur in the example flow

## Exclusions

- mutation selection through `fixedCacheKey` -- covered by `SIG-004`
- multi-API registration behavior -- covered by `SIG-003`

## Architectural decisions

- **Selector helper shape:** add exactly one host-store helper, `store.selectApiState(...)`
- **Selector equivalence:** keep the helper behaviorally equivalent to `api.selectSignal(endpoint.select(...))`
- **Registration guard:** only registered APIs may be selected from a host store

---

## `SIG-003` Multi-API Registry and Duplicate Guard

Parent Spec: [2026-04-13-signal-store-runtime-spec.md](/Users/pw-smoro/Repositorios/ngrx-rtk-query/docs/specs/2026-04-13-signal-store-runtime-spec.md)

## What to build

Extend the Signal Store runtime from single-API support to a true multi-API registry with explicit ownership by unique `reducerPath`, and enforce fail-fast rejection of duplicate `reducerPath` registration in every environment.

**Role:** Vertical Slice
**Execution mode:** AFK
**Irreversibility:** High -- fixes the long-term registry contract for multiple APIs in one host store
**Uncertainty:** Low
**Demoable happy path:** A host store registers two APIs with distinct `reducerPath` values and both API paths function without state collision; an invalid duplicate registration fails immediately.

## Blocked by

- `SIG-001` -- multi-API registration depends on the base runtime contract and isolated state container; verify single-API runtime is green and isolated.

## User stories addressed

From the parent spec:

- User story 5
- User story 6
- User story 18 (duplicate `reducerPath` guard portion)
- User story 20

## Acceptance criteria

Covered from the parent spec:

- multiple APIs may coexist when `reducerPath` values are unique
- duplicate `reducerPath` registration fails during setup in all environments
- no silent ownership collision is allowed
- direct runtime coverage exists for this guard family

Done for this slice when:

- [ ] One host Signal Store can register more than one RTK Query API when all `reducerPath` values are unique.
- [ ] Two registered APIs can both execute their supported flows without overwriting or ambiguously owning each other’s state.
- [ ] Registering duplicate `reducerPath` values throws an explicit error during setup in every environment.
- [ ] The duplicate-key behavior is covered directly at the runtime level, not only through example app behavior.

## Exclusions

- visible example UX for multi-API composition -- out of scope per parent spec
- mutation identity rules -- covered by `SIG-004`

## Architectural decisions

- **Registry contract:** allow multiple APIs per host store only when each uses a unique `reducerPath`
- **Failure model:** duplicate `reducerPath` is a fail-fast structural error, not a late or silent collision

---

## `SIG-004` Mutation Selector Contract

Parent Spec: [2026-04-13-signal-store-runtime-spec.md](/Users/pw-smoro/Repositorios/ngrx-rtk-query/docs/specs/2026-04-13-signal-store-runtime-spec.md)

## What to build

Extend `store.selectApiState(...)` to mutation endpoints through a stable public identity keyed by `fixedCacheKey`, and make unsupported mutation selection fail explicitly instead of relying on ephemeral request identities or best-effort behavior.

**Role:** Vertical Slice
**Execution mode:** AFK
**Irreversibility:** High -- fixes the public mutation-selection contract on the host store
**Uncertainty:** Low
**Demoable happy path:** A developer triggers a mutation with `fixedCacheKey` and can observe its mutation state through `store.selectApiState(...)`.

## Blocked by

- `SIG-001` -- mutation selection still depends on the base runtime existing; verify the Signal Store runtime can execute at least one mutation flow.
- `SIG-002` -- mutation selection extends the same public selector helper; verify query/infinite selection already behaves equivalently to `api.selectSignal(...)`.

## User stories addressed

From the parent spec:

- User story 11
- User story 12
- User story 18 (invalid mutation selection identity portion)

## Acceptance criteria

Covered from the parent spec:

- mutation selection is public only through endpoint plus `fixedCacheKey`
- `requestId` is not a supported public selection identity
- missing or invalid `fixedCacheKey` fails explicitly

Done for this slice when:

- [ ] `store.selectApiState(...)` can read mutation state through endpoint plus `fixedCacheKey`.
- [ ] Mutation state selected through the host store remains behaviorally equivalent to the underlying RTK Query selection path.
- [ ] Calling the helper for a mutation endpoint without a valid `fixedCacheKey` throws an explicit, actionable error.
- [ ] The public contract does not expose best-effort mutation selection or `requestId`-based selection.

## Exclusions

- redesigning mutation hooks or their trigger API
- exposing raw mutation cache internals on the host store

## Architectural decisions

- **Mutation identity:** support only stable public identity through `fixedCacheKey`
- **Non-support:** do not expose mutation selection by `requestId`

---

## `SIG-005` Public Parity, Docs, and Example Surface

Parent Spec: [2026-04-13-signal-store-runtime-spec.md](/Users/pw-smoro/Repositorios/ngrx-rtk-query/docs/specs/2026-04-13-signal-store-runtime-spec.md)

## What to build

Publish the Signal Store runtime as a first-class third runtime in the package’s release-facing surfaces: optional peer dependency, main README coverage, entrypoint README coverage, a complete example variant, example-level validation, and lightweight e2e parity.

**Role:** Vertical Slice
**Execution mode:** AFK
**Irreversibility:** Low
**Uncertainty:** Low
**Demoable happy path:** A maintainer follows the public docs, imports the runtime from `ngrx-rtk-query/signal-store`, runs the Signal Store example, and sees the documented behavior match the shipped example and lightweight e2e coverage.

## Blocked by

- `SIG-001` -- the release-facing surface depends on a real runtime, not a stub; verify the base runtime contract is stable enough to document.
- `SIG-002` -- the example must visibly demonstrate the selector bridge; verify the example already uses `store.selectApiState(...)`.
- `SIG-004` -- the public runtime contract includes mutation-selection behavior and failure model; verify that contract exists before documenting/releasing parity.

## User stories addressed

From the parent spec:

- User story 14
- User story 15
- User story 16
- User story 17
- User story 19

## Acceptance criteria

Covered from the parent spec:

- `@ngrx/signals` is treated as an optional peer
- Signal Store becomes a first-class runtime in the main README and entrypoint README
- a full `basic-signal-store` example variant exists
- example tests and lightweight e2e parity exist

Done for this slice when:

- [ ] The package surface reflects `@ngrx/signals` as an optional peer required only for the Signal Store runtime.
- [ ] The main README documents Signal Store as a first-class third runtime alongside the existing two runtimes.
- [ ] `packages/ngrx-rtk-query/signal-store/README.md` documents the entrypoint-specific contract.
- [ ] The `basic-signal-store` example is runnable and demonstrates the documented runtime path, including visible use of `store.selectApiState(...)`.
- [ ] Example-level tests and lightweight e2e cover the new variant with parity expectations similar to the existing examples.

## Included states

- `loading`: the example shows the documented initial query behavior
- `success`: the example shows loaded data and derived selector behavior
- `mutation in-flight/success`: the example remains demonstrably functional for the core mutation path

## Exclusions

- visible demo of multi-API registration -- out of scope per parent spec
- visible demo of structural guard failures in the example UX -- out of scope per parent spec

## Architectural decisions

- **Packaging:** keep the Signal Store runtime as a secondary entry point with optional peer dependency
- **Documentation positioning:** treat Signal Store as a first-class third runtime in public docs
- **Example positioning:** add a full third variant rather than collapsing examples into a shared architecture
