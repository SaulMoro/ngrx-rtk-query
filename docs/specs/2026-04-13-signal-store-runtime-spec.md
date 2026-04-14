# Spec: Signal Store Runtime for RTK Query

## Problem Statement

`ngrx-rtk-query` currently supports two runtime providers for wiring RTK Query into Angular applications: an `@ngrx/store` runtime and a standalone noop-store runtime. The repository already reserves a `signal-store` entry point, but it does not provide a working integration with `@ngrx/signals`.

For teams using Signal Store as their state composition model, the current options force them into a provider-centric setup that does not compose as a Signal Store feature. That leaves a gap in the public API, the documentation, and the example matrix. It also prevents Signal Store users from deriving RTK Query state through the host store in a way that matches the library’s signal-based ergonomics.

The new runtime must add Signal Store support without weakening the current contracts around multiple APIs, selector behavior, or optional runtime adoption.

## Solution

Add a third runtime for Signal Store through a new secondary entry point that exposes `withApi(api, { setupListeners? })`.

The feature composes inside a host `signalStore(...)`, wires the supplied RTK Query API into the library’s existing hook/runtime contract, and keeps RTK Query state isolated from the host store’s domain state. A single host store may register multiple RTK Query APIs as long as each API uses a unique `reducerPath`.

The feature adds one host-store helper, `store.selectApiState(...)`, which provides a Signal Store-native way to read RTK Query state for registered endpoints. Its result is behaviorally equivalent to selecting the same endpoint state through `api.selectSignal(...)`. The helper supports queries, infinite queries, and mutations through one public name, with endpoint-specific identity rules.

This runtime is documented as a first-class third option in the main package documentation and is validated through a full example variant with matching lightweight e2e coverage.

## User Stories

1. As an Angular developer using Signal Store, I want to register an RTK Query API as a Signal Store feature, so that I can compose data fetching with the same store model I already use.
2. As an Angular developer using Signal Store, I want the runtime to be imported from a dedicated `signal-store` entry point, so that optional runtime contracts stay explicit.
3. As an Angular developer, I want `withApi(api)` to support the same generated RTK Query hooks as the other runtimes, so that I do not need a different endpoint authoring model for Signal Store.
4. As an Angular developer, I want `withApi(api)` to accept the same `setupListeners` configuration shape as the other runtimes, so that runtime behavior stays predictable across integrations.
5. As an Angular developer, I want multiple RTK Query APIs to coexist in one host Signal Store, so that a single store can coordinate several API slices when needed.
6. As an Angular developer, I want registration to fail immediately when two APIs use the same `reducerPath`, so that state collisions never become late or silent bugs.
7. As an Angular developer, I want RTK Query state to remain isolated from my domain state, so that adding the runtime does not pollute my store model or leak internal cache structure into unrelated features.
8. As an Angular developer, I want to derive query state from the host store through `store.selectApiState(...)`, so that I can compose view state with Signal Store ergonomics.
9. As an Angular developer, I want `store.selectApiState(...)` to return the same signal semantics as `api.selectSignal(...)`, so that derived state stays predictable and familiar.
10. As an Angular developer, I want `store.selectApiState(...)` to accept query and infinite-query endpoints plus their arguments, so that I can select the exact cache entry I care about.
11. As an Angular developer, I want `store.selectApiState(...)` to accept mutation endpoints plus a `fixedCacheKey`, so that mutation state can be selected through a stable public identity.
12. As an Angular developer, I want mutation selection without a valid `fixedCacheKey` to fail explicitly, so that the API does not pretend unstable mutation identities are safe to depend on.
13. As an Angular developer, I want selection against an endpoint whose API was not registered in the host store to fail explicitly, so that wiring mistakes are actionable.
14. As a maintainer, I want `@ngrx/signals` to remain an optional peer for the package, so that users of the existing runtimes are not forced into a dependency they do not use.
15. As a maintainer, I want the main README to document Signal Store as a first-class runtime, so that the package’s public guidance matches the supported runtime matrix.
16. As a maintainer, I want a dedicated Signal Store example app, so that support is validated in a runnable variant instead of only by type-level or README claims.
17. As a maintainer, I want the example app to visibly demonstrate `store.selectApiState(...)`, so that the new host-store selector bridge is discoverable and testable.
18. As a reviewer, I want contract guards for duplicate `reducerPath`, unregistered endpoint selection, and invalid mutation selection to be covered directly, so that correctness does not depend on the example alone.
19. As a reviewer, I want the existing `@ngrx/store` and noop-store runtimes to remain behaviorally unchanged, so that adding Signal Store support is additive rather than disruptive.
20. As a future implementer, I want the spec to make the runtime boundaries and validation targets explicit, so that execution slices can be created without reopening architecture.

## Implementation Decisions

- Add a new Signal Store runtime as a secondary entry point that exposes `withApi(api, { setupListeners? })`.
- Keep the Signal Store runtime additive. Existing `@ngrx/store` and noop-store runtimes remain unchanged in behavior and positioning.
- Treat `@ngrx/signals` as an optional peer dependency because only the Signal Store runtime requires it.
- Allow multiple RTK Query APIs in the same host Signal Store when, and only when, every registered API uses a unique `reducerPath`.
- Enforce duplicate `reducerPath` detection as a fail-fast runtime contract in all environments.
- Keep RTK Query state isolated from the host store’s domain state. The feature owns its internal cache state and does not merge that cache into the user’s domain model as first-class domain state.
- Add exactly one host-store helper, `store.selectApiState(...)`, as the only public surface added by `withApi(...)` beyond feature registration.
- Make `store.selectApiState(...)` behaviorally equivalent to selecting the same endpoint state through `api.selectSignal(...)`.
- Use one public selector helper name across queries, infinite queries, and mutations, but preserve endpoint-specific identity rules under that single name.
- For query and infinite-query endpoints, `store.selectApiState(...)` selects a concrete cache entry by endpoint plus query argument.
- For mutation endpoints, `store.selectApiState(...)` selects state by endpoint plus `fixedCacheKey`. Public selection by `requestId` is not supported.
- Fail explicitly when `store.selectApiState(...)` is used with a mutation endpoint without a valid `fixedCacheKey`.
- Fail explicitly when `store.selectApiState(...)` receives an endpoint whose API has not been registered through `withApi(...)` in the current host store.
- Keep `withApi(...)` as a Signal Store feature contract, not a provider-style integration, because the chosen direction is feature composition inside `signalStore(...)`.
- Keep the public import contract explicit through `ngrx-rtk-query/signal-store`; do not add this runtime to the package root export surface.
- Document Signal Store as a first-class third runtime in the main README and maintain entry-point-specific documentation in the `signal-store` README.
- Add a full third example variant for Signal Store with a runnable app, example-level tests, and lightweight e2e parity with the existing runtime variants.
- Use the example app to demonstrate basic Signal Store integration and one visible use of `store.selectApiState(...)`. Do not use the example app to demonstrate multi-API registration or error guard behavior.

### Decision Log

**Decision:** Expose the Signal Store runtime as `withApi(api, { setupListeners? })` in a secondary `signal-store` entry point.
**Alternatives considered:** a third provider-style runtime; root export instead of secondary entry point.
**Why:** The chosen direction matches Signal Store composition directly and keeps the optional runtime contract explicit. A provider-style runtime would repeat the older integration model instead of fitting `signalStore(...)`, while a root export would blur optional runtime boundaries.

**Decision:** Add one host-store helper, `store.selectApiState(...)`, instead of keeping the integration fully infra-only.
**Alternatives considered:** no host-store helper; selector sugar on the `api` object instead of the store.
**Why:** The host-store helper is the smallest public addition that unlocks Signal Store-native derivation while keeping the rest of the runtime internal. A fully infra-only design would miss a core ergonomic goal, while moving the sugar onto `api` would not satisfy the requirement that the helper travel with the feature.

**Decision:** Keep RTK Query state isolated from the host store’s domain state.
**Alternatives considered:** merge RTK Query state into the host store root state under public slices.
**Why:** Isolation preserves host-store domain ownership, avoids exposing RTK cache internals as domain state, and leaves room to change runtime internals without widening the public contract.

**Decision:** Allow multiple APIs per host store but require unique `reducerPath` values with fail-fast validation.
**Alternatives considered:** single API per host store; allow duplicates and rely on last-write-wins or late failures.
**Why:** Multiple APIs are a real compositional need and should not be blocked by an artificial limitation. Duplicate `reducerPath` values create ambiguous ownership and state collisions, so they must fail immediately rather than degrade into undefined behavior.

**Decision:** Support mutation selection only through `fixedCacheKey`, not `requestId`.
**Alternatives considered:** expose selection by `requestId`; attempt best-effort mutation selection without stable identity.
**Why:** `fixedCacheKey` is the only mutation identity that is stable enough to serve as a public selection contract. `requestId` is too ephemeral for durable store derivation, and best-effort selection would make the API ambiguous and brittle.

### Invariants

- A host Signal Store may only register one RTK Query API per `reducerPath`.
- Duplicate `reducerPath` registration must fail during runtime setup in every environment.
- RTK Query cache state owned by the Signal Store runtime must remain isolated from the host store’s domain-facing state model.
- `store.selectApiState(...)` may only read state for endpoints whose owning API has been registered in the current host store.
- `store.selectApiState(...)` must remain behaviorally equivalent to `api.selectSignal(endpoint.select(...))` for supported endpoint families.
- Mutation selection through `store.selectApiState(...)` requires a stable public identity via `fixedCacheKey`.
- Existing store and noop-store runtimes must remain additive-only impacts of this work.

### Failure Model

**Class name:** DuplicateReducerPathRegistration  
**Cause:** Two or more `withApi(...)` registrations in the same host store use the same `reducerPath`.  
**Impact:** The host store cannot determine safe ownership for RTK Query state.  
**Recovery strategy:** Fail runtime setup immediately with an explicit error naming the conflicting `reducerPath`.  
**Operator intervention:** The developer must change the conflicting API definitions or store composition.

**Class name:** UnregisteredEndpointSelection  
**Cause:** `store.selectApiState(...)` receives an endpoint whose owning API was not registered through `withApi(...)` in the current host store.  
**Impact:** Selector usage targets state that does not belong to the host store.  
**Recovery strategy:** Throw an explicit error naming the endpoint and the missing API registration requirement.  
**Operator intervention:** The developer must register the API in the host store or stop selecting it from that store.

**Class name:** InvalidMutationSelectionIdentity  
**Cause:** `store.selectApiState(...)` is called for a mutation endpoint without a valid `fixedCacheKey`.  
**Impact:** The selection request has no stable public identity and would otherwise be ambiguous.  
**Recovery strategy:** Throw an explicit error requiring `fixedCacheKey` for mutation selection.  
**Operator intervention:** The developer must adopt `fixedCacheKey` for that mutation flow or avoid store-level mutation selection.

Silent failures are out of contract for these cases. All three classes must fail explicitly and actionably.

### Compatibility / Migration / Rollout

- This feature is additive. It introduces a new optional runtime and does not replace or modify the supported behavior of existing runtimes.
- The Signal Store runtime is available only through a secondary entry point and optional peer dependency, so existing consumers do not need to change imports or install `@ngrx/signals` unless they adopt the new runtime.
- The main README expands from a two-runtime story to a three-runtime story. Existing documentation for the current runtimes remains valid.
- Example coverage expands from two runtime variants to three. Existing example apps remain supported and unchanged in role.
- No prior canonical spec exists for this feature in this repository, so this document is the first canonical source of truth.

### Risks and Mitigations

- **Risk:** The host-store helper becomes a back door for exposing more RTK internals later.
  - **Mitigation:** Keep the added surface limited to `store.selectApiState(...)` and define its behavior strictly as equivalence to `api.selectSignal(...)`.
- **Risk:** Example-level validation passes while runtime guard behavior regresses.
  - **Mitigation:** Require direct runtime tests for registration guards and selector contract in addition to the example-heavy validation emphasis.
- **Risk:** Multiple APIs in one host store create hidden collisions or ambiguous ownership.
  - **Mitigation:** Validate `reducerPath` uniqueness at setup time and keep state ownership isolated inside the runtime.

## Testing Decisions

- Good tests validate the runtime’s external contract and observable behavior, not internal cache shape or implementation-specific storage details.
- Validation emphasis is example-heavy, but the spec still requires a minimum direct-runtime test layer because the highest-risk logic lives in registration guards and selector behavior.
- The highest-value direct test targets are:
  - the `withApi(...)` registration and registry layer,
  - duplicate `reducerPath` fail-fast behavior,
  - unregistered endpoint selection failure,
  - mutation selection failure without `fixedCacheKey`,
  - equivalence between `store.selectApiState(...)` and `api.selectSignal(...)`.
- The highest-value example-level targets are:
  - the Signal Store example boots and performs the same core query/mutation flows as the current runtime variants,
  - the example visibly demonstrates a derived state use of `store.selectApiState(...)`,
  - lightweight e2e confirms the new variant is wired and reachable like the existing examples.
- Prior art for validation comes from the existing runtime variants in this repository:
  - unit/integration-style example tests for store and noop-store flows,
  - lightweight e2e smoke coverage per example variant,
  - direct behavioral resets and request-state assertions already used around current runtime examples.

### Technical Acceptance Criteria

- A Signal Store consumer can register an RTK Query API through `withApi(api, { setupListeners? })` from `ngrx-rtk-query/signal-store`.
- A host Signal Store can register more than one RTK Query API when every API uses a unique `reducerPath`.
- Duplicate `reducerPath` registration fails during setup with an explicit error in all environments.
- RTK Query state remains isolated from host domain state rather than becoming public domain-owned root state.
- `store.selectApiState(...)` supports query, infinite-query, and mutation endpoint families through one public name.
- Query and infinite-query selection target a concrete cache entry by endpoint plus argument.
- Mutation selection requires `fixedCacheKey` and fails explicitly without it.
- Endpoint selection against an API not registered in the current host store fails explicitly.
- `store.selectApiState(...)` remains behaviorally equivalent to `api.selectSignal(endpoint.select(...))`.
- The Signal Store runtime is documented in the main README and the `signal-store` entry-point README.
- The repository contains a full third example variant for Signal Store, including example tests and lightweight e2e parity.

### Validation Notes

- Do not over-specify tests around the internal storage shape used to isolate RTK Query state. The contract is isolation and correct selection behavior, not a specific internal object layout.
- Put strong validation around the selector bridge because it is the smallest public API addition with the highest chance of type-level and runtime drift.
- Put strong validation around fail-fast guard behavior because these failures are structural and must never degrade into silent or late errors.
- Keep example validation user-visible: core data flow plus visible derived state through `store.selectApiState(...)`.

## Out of Scope

- Adding the Signal Store runtime to the root package export surface.
- Reworking the current `@ngrx/store` or noop-store runtime contracts beyond additive documentation updates.
- Exposing raw internal RTK Query state on the host store beyond the single `store.selectApiState(...)` helper.
- Supporting mutation selection by `requestId`.
- Making the example app demonstrate multi-API composition or runtime guard failures in its visible UX.
- Redesigning generated hook APIs, endpoint authoring, or cache semantics beyond what is required to support the new runtime.
- Changing the package’s current example variants into a shared single-example architecture.
