# AGENTS.md

`ngrx-rtk-query` is an Angular library that adapts RTK Query hooks to Angular signals. Durable maintainer truth lives in `docs/*.md`, `CONTRIBUTING.md`, ADRs, and entrypoint READMEs. Public user documentation lives in `packages/ngrx-rtk-query/README.md`.

## Project Map

- `packages/ngrx-rtk-query` - public package.
- `packages/ngrx-rtk-query/core` - store-agnostic `createApi`, `fetchBaseQuery`, hooks, and types.
- `packages/ngrx-rtk-query/store` - NgRx Store runtime provider.
- `packages/ngrx-rtk-query/noop-store` - non-NgRx runtime provider.
- `packages/ngrx-rtk-query/signal-store` - NgRx Signal Store host and reader features.
- `examples/basic-ngrx-store` - NgRx Store consumer example.
- `examples/basic-noop-store` - Noop Store consumer example.
- `examples/basic-signal-store` - Signal Store consumer example.
- `examples/*-e2e` - Playwright runtime tracer bullets.
- `docs/specs` - active plans and rollout context.

## Durable Docs

- `packages/ngrx-rtk-query/README.md` - public install and usage documentation.
- `CONTRIBUTING.md` - contribution flow, change types, evidence, and changesets.
- `docs/HARNESS.md` - documentation placement and agent harness model.
- `docs/ARCHITECTURE.md` - entrypoints, runtime hosts, boundaries, and upstream-sync architecture.
- `docs/TESTING.md` - test strategy, examples, and runtime matrix.
- `docs/VALIDATION.md` - validation commands, hooks, and failure recovery.
- `docs/RELEASE.md` - versioning, changesets, Angular/Nx updates, and RTK Query sync.
- `docs/adrs/` - accepted durable decisions.
- `packages/ngrx-rtk-query/core/README.md` - core entrypoint boundary; sibling entrypoint READMEs own runtime-specific details.

<important if="you need to understand public usage, install paths, examples, or troubleshooting">
- Read `packages/ngrx-rtk-query/README.md`. It is the canonical public documentation and the root README symlink target.
</important>

<important if="you are choosing where code lives, changing public exports, or touching runtime boundaries">
- Read `docs/ARCHITECTURE.md` and the owning entrypoint README first.
- Keep store-specific code out of `core`.
- Treat public exports and hook return shapes as package contracts.
</important>

<important if="you are fixing behavior, changing hooks, changing lifecycle, or adding tests">
- Prefer a failing public-surface test before implementation when practical.
- Test through published entrypoints and generated APIs, not private helpers.
- Check the runtime matrix in `docs/TESTING.md` for host-specific regressions.
</important>

<important if="you are changing docs, harness files, scripts, hooks, release config, or package metadata">
- Read `docs/HARNESS.md`, `docs/VALIDATION.md`, and `docs/RELEASE.md`.
- Keep durable docs free of active rollout notes. Use `docs/specs/` for plans.
- Run `pnpm docs:check` for focused documentation validation.
- Agent stop hooks are configured in `.codex/hooks.json`, `.claude/settings.json`, and `.opencode/plugins/verify-on-idle.ts`.
</important>

<important if="you are validating changes or preparing a handoff">
- Use `pnpm verify` as the default local validation command.
- Use `pnpm verify:full` for behavior, public contract, runtime lifecycle, example, dependency, or release changes.
- Add `pnpm build:ngrx-rtk-query` when the published package surface changed.
</important>

<important if="you are syncing with RTK Query React hooks">
- Read `docs/RELEASE.md`.
- Compare upstream `buildHooks.ts`, `module.ts`, and hook types together.
- Review refactor and optimization commits as behavior-adjacent until proven otherwise.
</important>

<important if="you are adding or updating changesets">
- Add a changeset for published package behavior, public types, peer dependency, or entrypoint changes.
- Do not add a changeset for maintainer-only docs, tests, or harness changes unless explicitly requested.
</important>

<important if="you are about to delete a published export, change package entrypoints, alter release workflow, change peer dependencies, or perform destructive git operations">
- Stop and ask before proceeding.
</important>

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->
<important if="you are working with Nx (scaffolding, running tasks, or exploring projects)">
- Use `pnpm nx run`, `pnpm nx run-many`, and `pnpm nx affected` instead of underlying tools.
- Explore projects with `pnpm nx show projects` and `pnpm nx show project <project> --json`.
- Read `docs/VALIDATION.md` before changing task or verification behavior.
</important>
<!-- nx configuration end-->
