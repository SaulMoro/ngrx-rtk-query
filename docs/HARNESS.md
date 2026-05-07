# Harness

This document defines the repository documentation model and the agent harness contract. The public library documentation lives in `packages/ngrx-rtk-query/README.md`.

## How This Repo Works

- `AGENTS.md` is the Tier 1 agent map. It stays short and routes to owner docs.
- `README.md` is a symlink to `packages/ngrx-rtk-query/README.md`.
- `packages/ngrx-rtk-query/README.md` is the canonical public documentation for users because there is no separate documentation website today. It must be complete enough to use the library without another docs site.
- `CONTRIBUTING.md` owns contributor workflow, change types, review evidence, changesets, and validation expectations.
- Flat `docs/*.md` files hold durable maintainer policy.
- `docs/adrs/` holds accepted decisions and the ADR template.
- `docs/specs/` holds active rollout context and plans that should not become durable policy.
- `docs/agents/` is reserved for agent-only operational configuration. Do not use it for human onboarding or shared maintainer policy.
- Entrypoint READMEs under `packages/ngrx-rtk-query/*/README.md` own local public-surface details.
- `tools/verify/check-docs.mjs` provides mechanical back-pressure against documentation drift.
- Agent stop or idle verification enters through `.codex/hooks.json`, `.claude/settings.json`, and `.opencode/plugins/verify-on-idle.ts`.

## Audience Model

- Public users read `packages/ngrx-rtk-query/README.md`.
- Maintainers read `CONTRIBUTING.md` and the durable owner doc for the task.
- Agents start with `AGENTS.md`, then follow the smallest owner doc that answers the current task.
- ADRs explain hard-to-reverse decisions and trade-offs. They are history plus rationale, not active task notes.
- Specs are allowed to contain temporary planning state. Root files and flat `docs/*.md` files are not.

## Owner Docs

| Concern                                                                        | Owner                                 |
| ------------------------------------------------------------------------------ | ------------------------------------- |
| Public install, concepts, runtime choice, usage, examples, and troubleshooting | `packages/ngrx-rtk-query/README.md`   |
| Contribution workflow, change types, review evidence                           | `CONTRIBUTING.md`                     |
| Harness model, documentation placement, docs checks                            | `docs/HARNESS.md`                     |
| Library architecture, entrypoints, runtime hosts, boundaries                   | `docs/ARCHITECTURE.md`                |
| Test strategy, examples, runtime matrix, E2E scope                             | `docs/TESTING.md`                     |
| Local validation commands, hooks, failure recovery                             | `docs/VALIDATION.md`                  |
| Versioning, changesets, Angular/Nx upgrades, RTK sync                          | `docs/RELEASE.md`                     |
| Accepted hard-to-reverse decisions                                             | `docs/adrs/`                          |
| Active rollout plans                                                           | `docs/specs/`                         |
| Entrypoint public surfaces                                                     | `packages/ngrx-rtk-query/*/README.md` |
| Verification tooling                                                           | `tools/verify/README.md`              |

## Placement Rules

- The closer a document is to the root, the more durable it must be.
- Put consumer usage in the package README, not in `AGENTS.md`.
- Treat missing consumer usage in the package README as a public documentation gap, not as something to compensate for in maintainer docs.
- Put maintainer workflow in `CONTRIBUTING.md`, `docs/*.md`, or local tool READMEs.
- Put accepted decisions in ADRs only when they are hard to reverse, surprising without context, and involve a real trade-off.
- Put active plans and rollout uncertainty in `docs/specs/`.
- Do not duplicate the same policy across `AGENTS.md`, `CONTRIBUTING.md`, `docs/*.md`, and local READMEs.
- Do not create additional subdirectories under `docs/` beyond `adrs/`, `agents/`, and `specs/`.

## Enforced Invariants

`pnpm docs:check` enforces the core harness structure:

- `README.md` must remain a symlink to `packages/ngrx-rtk-query/README.md`.
- `CLAUDE.md` must remain a symlink to `AGENTS.md`.
- `AGENTS.md` must stay short and reference the durable owner docs.
- `docs/` may contain only flat Markdown files plus `docs/adrs/`, `docs/agents/`, and `docs/specs/`.
- ADRs must follow the template shape.
- Local Markdown links must resolve.
- Local Markdown heading anchors must resolve.
- Local path references in Markdown links and backticks must resolve when they point inside the repository.
- Root docs, flat `docs/*.md` files, `docs/agents/*.md`, package READMEs, and tool READMEs may not contain active-rollout markers, placeholder status lines, or open-question sections.
- The public package README must keep the required consumer documentation sections for setup, concepts, runtime selection, generated hooks, cache behavior, Signal Store readers, testing, examples, and troubleshooting.
- Secondary entrypoint READMEs must document their public surface.
- Agent stop or idle hook config must delegate to `tools/verify/verify-on-stop.sh`.

## Harness Changes

Changes to `AGENTS.md`, `CONTRIBUTING.md`, `docs/*.md`, `docs/adrs/`, `tools/verify/`, `.githooks/`, `.codex/`, `.claude/`, `.opencode/`, `package.json` scripts, or release workflow are harness changes. Keep the owner docs and verification scripts aligned in the same change.
