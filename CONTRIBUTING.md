# Contributing

Thanks for contributing to `ngrx-rtk-query`. This repository publishes an Angular library, so public API, types, peer dependencies, runtime behavior, and documentation examples are package contracts.

## Setup

- Use the Node.js and `pnpm` versions declared in `package.json#engines`.
- Install dependencies with `pnpm install`.
- Use `pnpm` for repository commands.
- Fork the repository before opening external pull requests.

## Before Implementing

- Search existing issues before starting large work.
- Open an issue first for broad design changes, public API changes, or opinion-driven rewrites.
- Read `docs/ARCHITECTURE.md` before changing entrypoints, runtime hosts, or public exports.
- Read `docs/TESTING.md` before changing hooks, runtime lifecycle, examples, or tests.
- Read `docs/RELEASE.md` before changing dependencies, versions, changesets, or release behavior.

## Common Commands

| Command                     | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `pnpm dev:basic-store`      | Run the NgRx Store example                              |
| `pnpm dev:noop-store`       | Run the Noop Store example                              |
| `pnpm dev:signal-store`     | Run the Signal Store example                            |
| `pnpm build:ngrx-rtk-query` | Build the public package                                |
| `pnpm docs:check`           | Validate durable docs and README contracts              |
| `pnpm verify`               | Default local handoff check                             |
| `pnpm verify:full`          | Full local handoff check with affected tests and format |
| `pnpm verify:branch:full`   | Branch-scoped pre-push check                            |
| `pnpm affected:test`        | Lower-level affected test command                       |
| `pnpm affected:e2e`         | Lower-level affected E2E command                        |

## Change Types

| Change type                  | Use when                                                                                                     | Required validation                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Routine scoped change        | Small implementation or doc changes without public behavior or contract impact                               | Targeted check plus `pnpm verify`                                                                                |
| Behavior change              | Hook behavior, runtime state, example behavior, or user-visible output changes                               | Failing repro or targeted test, then `pnpm verify:full`                                                          |
| Public contract change       | Public exports, hook types, runtime provider contracts, README usage contract, or package entrypoints change | Targeted public-surface tests, `pnpm build:ngrx-rtk-query`, `pnpm verify:full`, and a changeset when user-facing |
| Harness change               | `AGENTS.md`, `CONTRIBUTING.md`, `docs/*.md`, `tools/verify`, package scripts, or git hooks change            | `pnpm docs:check` and `pnpm verify`                                                                              |
| Release or dependency change | Changesets, release workflows, Angular/Nx/RTK versions, lockfile, or package metadata change                 | `pnpm verify:full`, `pnpm build:ngrx-rtk-query`, and release-specific checks                                     |

## Review Evidence

Every handoff should state:

- Problem: what changed or failed.
- Scope: files, package surfaces, runtimes, or examples affected.
- Change type: one row from the table above.
- Validation: exact commands or browser checks run.
- Risk: required for public contract, runtime, dependency, release, or harness changes.
- Follow-up: known gaps or next work if any risk remains.

## Changesets

Run `pnpm changeset` when the published package contract changes:

- public behavior,
- public types,
- public exports or entrypoints,
- peer dependencies,
- package metadata that users consume,
- user-facing documentation corrections that should appear in release notes.

Do not add a changeset for maintainer-only docs, tests, internal specs, or harness changes unless explicitly requested.

## Git

- Use conventional commits.
- The repository installs `.githooks` through `pnpm prepare`.
- `pre-commit` runs `lint-staged`; staged docs and harness files trigger `pnpm docs:check`.
- `commit-msg` runs commitlint.
- `pre-push` runs `pnpm verify:branch:full`.

## Ask Before Continuing

Ask before deleting a published export, changing package entrypoints, changing peer dependencies, altering release workflows, introducing dependencies, or making destructive git changes.

## Pull Requests

Before opening a PR, run the validation required by the change type and include the review evidence in the PR body. Use `gh pr create --web` if you prefer the GitHub UI.
