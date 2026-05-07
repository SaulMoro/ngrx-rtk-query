---
status: accepted
date: 2026-05-07
---

# Adopt Harness Engineering as the Repository Operating Model

## Context and Problem Statement

`ngrx-rtk-query` is maintained through a mix of public library work, Angular/Nx upgrades, RTK Query upstream sync, example-app validation, and agent-assisted implementation. Agents need short durable context, clear read paths, and deterministic feedback loops. The repository needs an explicit operating model that keeps public documentation useful for consumers while keeping maintainer and agent guidance versioned in repo-local owner docs.

## Decision Drivers

- Keep the public package README focused on library users.
- Keep `AGENTS.md` short enough to be useful on every task.
- Make maintainer policy discoverable without relying on prior chats.
- Use deterministic verification instead of prose-only discipline where practical.
- Add harness complexity incrementally and only where it protects real contracts.

## Considered Options

- Keep all guidance in `AGENTS.md` and the package README.
- Create a separate documentation website before improving repo docs.
- Adopt harness engineering with progressive disclosure inside the repository.

## Decision Outcome

Chosen option: "Adopt harness engineering with progressive disclosure inside the repository", because the repository currently has no separate docs site and needs both public package documentation and maintainer guidance to stay durable without competing for the same file.

### Consequences

- Good, because the package README remains the canonical public documentation.
- Good, because agents can start from `AGENTS.md` and then read the smallest owner doc for the task.
- Good, because verification scripts and docs checks create mechanical back-pressure against drift.
- Bad, because the harness becomes a maintained part of the repository.
- Bad, because new docs and checks must be curated instead of added casually.

### Confirmation

The decision is confirmed when:

- `AGENTS.md` is short, routing-first, and points to owner docs.
- `packages/ngrx-rtk-query/README.md` remains the public package documentation.
- Durable maintainer guidance lives in `docs/*.md`, `docs/adrs/*.md`, `CONTRIBUTING.md`, and entrypoint READMEs.
- `tools/verify/check-docs.mjs` enforces the core documentation structure.
- `pnpm verify` is the default maintainer validation command.

## Pros and Cons of the Options

### Keep all guidance in `AGENTS.md` and the package README

- Good, because it requires no new structure.
- Good, because all current content stays easy to find by path.
- Bad, because `AGENTS.md` becomes too long for Tier 1 context.
- Bad, because public consumer docs and maintainer operating policy compete inside the package README.

### Create a separate documentation website before improving repo docs

- Good, because a docs site could eventually provide a better consumer experience.
- Neutral, because the public README can still seed that future site.
- Bad, because it delays the immediate need for complete package documentation.
- Bad, because it does not solve agent onboarding or maintainer validation by itself.

### Adopt harness engineering with progressive disclosure inside the repository

- Good, because it separates public docs, maintainer policy, accepted decisions, and active specs.
- Good, because local validation can enforce important structural contracts.
- Good, because the model can evolve from actual friction instead of speculative tooling.
- Bad, because the docs gradient must be maintained when contracts change.

## More Information

- `AGENTS.md`
- `docs/HARNESS.md`
- `docs/VALIDATION.md`
- `docs/RELEASE.md`
- `packages/ngrx-rtk-query/README.md`
