# AGENTS.md

`ngrx-rtk-query` is an Angular 21/Nx 22 library that adapts RTK Query hooks to Angular signals.

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

## Owner Docs

- `packages/ngrx-rtk-query/README.md` - public install, usage, runtime choice, examples, and troubleshooting.
- `CONTRIBUTING.md` - contribution flow, change types, evidence, and changesets.
- `docs/HARNESS.md` - documentation placement and agent harness model.
- `docs/ARCHITECTURE.md` - entrypoints, runtime hosts, boundaries, and upstream-sync architecture.
- `docs/TESTING.md` - test strategy, examples, runtime matrix, and E2E scope.
- `docs/VALIDATION.md` - validation commands, hooks, and failure recovery.
- `docs/RELEASE.md` - versioning, changesets, Angular/Nx updates, and RTK Query sync.
- `docs/adrs/` - accepted durable decisions.
- `packages/ngrx-rtk-query/core/README.md` - core entrypoint boundary.
- `packages/ngrx-rtk-query/store/README.md`, `packages/ngrx-rtk-query/noop-store/README.md`, and `packages/ngrx-rtk-query/signal-store/README.md` - runtime-specific entrypoint boundaries.

<important if="you need to run commands to build, test, lint, validate, serve, publish, or generate code">

Run commands from the repo root with `pnpm`.

| Command                      | Purpose                                                        |
| ---------------------------- | -------------------------------------------------------------- |
| `pnpm affected:build`        | Build affected projects.                                       |
| `pnpm affected:check`        | Run affected lint and typecheck, then format check.            |
| `pnpm affected:dep-graph`    | Open affected dependency graph.                                |
| `pnpm affected:e2e`          | Run affected Playwright tracer bullets.                        |
| `pnpm affected:e2e:watch`    | Run affected Playwright tracer bullets in watch mode.          |
| `pnpm affected:lint`         | Lint affected projects.                                        |
| `pnpm affected:test`         | Test affected projects.                                        |
| `pnpm build:ngrx-rtk-query`  | Build the public package.                                      |
| `pnpm contributors:add`      | Add an all-contributors entry.                                 |
| `pnpm contributors:generate` | Regenerate all-contributors output.                            |
| `pnpm dep-graph`             | Open the full Nx dependency graph.                             |
| `pnpm dep-graph:watch`       | Open the full Nx dependency graph in watch mode.               |
| `pnpm dev:basic-store`       | Serve the NgRx Store example.                                  |
| `pnpm dev:noop-store`        | Serve the Noop Store example.                                  |
| `pnpm dev:signal-store`      | Serve the Signal Store example.                                |
| `pnpm docs:check`            | Validate durable documentation structure and links.            |
| `pnpm format`                | Check formatting.                                              |
| `pnpm format:check`          | Check formatting.                                              |
| `pnpm preinstall`            | Enforce pnpm as the package manager.                           |
| `pnpm prepare`               | Configure Git hooks.                                           |
| `pnpm pub:beta`              | Build and publish a beta from the package directory.           |
| `pnpm pub:release`           | Build and publish a stable release from the package directory. |
| `pnpm release`               | Version packages with Changesets.                              |
| `pnpm update`                | Run Nx migrations.                                             |
| `pnpm verify`                | Default affected lint, typecheck, and conditional docs check.  |
| `pnpm verify:branch`         | Default branch-scoped verification against `origin/main`.      |
| `pnpm verify:branch:full`    | Full branch-scoped verification used by pre-push.              |
| `pnpm verify:full`           | Full local verification with tests and format check.           |

</important>

<important if="you need public usage, install paths, runtime choice, examples, or troubleshooting">
- Read `packages/ngrx-rtk-query/README.md`; the root `README.md` is a symlink to it.
</important>

<important if="you are changing documentation, harness files, scripts, hooks, package metadata, or release configuration">
- Read `docs/HARNESS.md`, `docs/VALIDATION.md`, and `docs/RELEASE.md`.
- Keep durable docs free of active rollout notes; use `docs/specs/` for plans.
- Run `pnpm docs:check` for focused documentation validation.
- Agent stop hooks are configured in `.codex/hooks.json`, `.claude/settings.json`, and `.opencode/plugins/verify-on-idle.ts`.
</important>

<important if="you are choosing where code lives, changing public exports, or touching runtime boundaries">
- Read `docs/ARCHITECTURE.md` and the owning entrypoint README first.
- Keep store-specific code out of `core`.
- Treat public exports and hook return shapes as package contracts.
</important>

<important if="you are fixing behavior, changing hooks, changing lifecycle, or adding tests">
- Prefer a failing public-surface test before implementation when practical.
- Test through published entrypoints and generated APIs, not private helpers.
- Check `docs/TESTING.md` for the runtime matrix and host-specific regressions.
</important>

<important if="you are validating changes or preparing a handoff">
- Use `pnpm verify` as the default local validation command.
- Use `pnpm verify:full` for behavior, public contract, runtime lifecycle, example, dependency, configuration, or release changes.
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
<important if="you are working with Nx scaffolding, Nx tasks, affected projects, or project graph exploration">
- Use `pnpm nx run`, `pnpm nx run-many`, and `pnpm nx affected` instead of underlying tools.
- Explore projects with `pnpm nx show projects` and `pnpm nx show project <project> --json`.
- Read `docs/VALIDATION.md` before changing task or verification behavior.
</important>
<!-- nx configuration end-->
