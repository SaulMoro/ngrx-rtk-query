# Verify

This directory owns repository validation wrappers and documentation harness checks.

## Public Surface

- `verify.sh` is the canonical maintainer verification wrapper. It runs affected lint and typecheck by default, can add affected tests and format checks, and conditionally runs docs validation when harness or durable docs changed.
- `verify-on-stop.sh` is the shared Codex, Claude, and OpenCode stop or idle verifier. It delegates to `verify.sh`, dedupes repeated failures for the same worktree state, and stays silent on success.
- `_verify-lib.sh` contains shared shell helpers for verification scripts. Source it from scripts in this directory; do not execute it directly.
- `check-docs.mjs` validates the documentation gradient, local Markdown links, ADR shape, public README sections, and secondary entrypoint README coverage.

## Change Rules

- Keep repository-specific validation semantics here instead of duplicating them in package scripts or hooks.
- Keep `pnpm verify` as the recommended default handoff command.
- Keep `pnpm verify:branch:full` aligned with the pre-push gate.
- Keep `.codex`, `.claude`, and `.opencode` hook config thin; they should call `verify-on-stop.sh`, not duplicate verification logic.
- Update `docs/VALIDATION.md` and `docs/HARNESS.md` when validation behavior changes.
