# Validation

This document records the repository validation strategy. Test authoring guidance lives in `docs/TESTING.md`.

## Default Commands

Use `pnpm verify` as the default local validation command after changes. It runs affected lint and affected typecheck, and runs `docs:check` when durable docs or harness files changed.

Use `pnpm verify:full` for behavior, public contract, runtime lifecycle, example, dependency, configuration, or release changes. It adds affected tests and formatting checks.

| Command                     | Purpose                                                    |
| --------------------------- | ---------------------------------------------------------- |
| `pnpm docs:check`           | Validate durable documentation structure and links         |
| `pnpm verify`               | Default affected lint + typecheck + conditional docs check |
| `pnpm verify:full`          | Default verification plus affected tests and format check  |
| `pnpm verify:branch`        | Branch-scoped default verification against `origin/main`   |
| `pnpm verify:branch:full`   | Branch-scoped full verification used by pre-push           |
| `pnpm build:ngrx-rtk-query` | Build the public package                                   |
| `pnpm affected:e2e`         | Run affected Playwright tracer bullets                     |

The existing `affected:*` scripts remain available as lower-level Nx commands. Prefer `pnpm verify` for maintainer handoffs because it encodes repository-specific docs and harness checks.

## Change-Type Validation

| Change type                  | Use when                                                                                                     | Required validation                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Routine scoped change        | A small implementation or doc change without public behavior or contract impact                              | Targeted check plus `pnpm verify`                                                                              |
| Behavior change              | Hook behavior, runtime state, example behavior, or user-visible output changes                               | Failing repro or targeted test, then `pnpm verify:full`                                                        |
| Public contract change       | Public exports, hook types, runtime provider contracts, README usage contract, or package entrypoints change | Targeted public-surface tests, `pnpm build:ngrx-rtk-query`, `pnpm verify:full`, and changeset when user-facing |
| Harness change               | `AGENTS.md`, `CONTRIBUTING.md`, `docs/*.md`, `tools/verify`, package scripts, or git hooks change            | `pnpm docs:check` and `pnpm verify`                                                                            |
| Release or dependency change | Changesets, release workflows, Angular/Nx/RTK versions, lockfile, or package metadata change                 | `pnpm verify:full`, `pnpm build:ngrx-rtk-query`, and release-specific checks                                   |

## Git Hooks

- `pre-commit` runs `lint-staged`; staged docs and harness files trigger `pnpm docs:check`.
- `commit-msg` runs commitlint.
- `pre-push` runs `pnpm verify:branch:full`.

The pre-push gate is intentionally stronger than the default local loop. Use targeted checks while developing, then let `pnpm verify` or `pnpm verify:full` prove the handoff.

## Agent Stop Hooks

- Codex Stop hooks enter through `.codex/hooks.json`.
- Claude Stop hooks enter through `.claude/settings.json`.
- OpenCode idle hooks enter through `.opencode/plugins/verify-on-idle.ts`.
- All three delegate to `tools/verify/verify-on-stop.sh`.

`verify-on-stop.sh` runs `tools/verify/verify.sh`, stays silent on success, dedupes repeated failures for the same worktree signature, and emits a `VERIFY_FAILURE_ID` when the harness should re-engage the agent.

## Failure Recovery

1. Capture the exact failing command and output.
2. Reduce to the smallest failing target or spec.
3. Fix the owning surface instead of weakening the check.
4. Re-run the same failing command.
5. Widen to the required validation command only after the focused repro passes.

If two iterations produce no new signal, stop and state the repro, hypothesis, failed attempts, and recommended next diagnostic step.
