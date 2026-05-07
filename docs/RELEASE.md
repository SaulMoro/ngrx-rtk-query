# Release

This document owns maintainer guidance for versioning, changesets, Angular/Nx upgrades, and RTK Query upstream sync.

## Version Policy

- Library majors track Angular majors.
- The latest Angular major in the README compatibility table is the active support line.
- Older supported rows receive bug or critical-bug fixes according to the README table.
- Public behavior, public types, peer dependency, and package entrypoint changes usually require a changeset.
- Docs-only and test-only changes do not require a changeset unless they correct a published user-facing contract that should appear in release notes.

## Changesets

Use `pnpm changeset` when a change should appear in the changelog or affects the published package contract.

Do not add a changeset for maintainer-only harness docs, internal specs, or tests unless the user explicitly asks for release metadata.

## Angular And Nx Updates

When updating Angular or Nx:

1. Run the Nx migration command through `pnpm update`.
2. Review generated migrations and package changes.
3. Apply migrations.
4. Update Angular, NgRx, and package peer dependency ranges together.
5. Run package build, affected tests, and example runtime checks.
6. Add a changeset with the appropriate version bump.

## RTK Query Upstream Sync

This library mirrors RTK Query React hook behavior where Angular signals can preserve the same semantics.

When updating RTK Query:

1. Check RTK Query React commits since the currently synced `@reduxjs/toolkit` version.
2. Compare upstream `buildHooks.ts`, `module.ts`, and hook types.
3. Review refactoring, optimization, and byte-shave commits as behavior-adjacent until proven otherwise.
4. Update Angular equivalents in `packages/ngrx-rtk-query/core/src/build-hooks.ts`, `module.ts`, and `types/hooks-types.ts`.
5. Update docs and tests for any public option, return field, lifecycle, or type change.
6. Run `pnpm build:ngrx-rtk-query` and `pnpm verify:full`.
7. Manually or automatically validate the affected examples when runtime behavior changed.

Feature additions often require several coordinated changes: option extraction, `initiate(...)` arguments, per-call override logic, JSDoc or README updates, and regression coverage.
