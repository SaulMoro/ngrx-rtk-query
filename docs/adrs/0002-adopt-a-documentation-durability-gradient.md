---
status: accepted
date: 2026-05-07
---

# Adopt a Documentation Durability Gradient

## Context and Problem Statement

Repository knowledge changes at different speeds. Public library usage, maintainer validation, release policy, architecture boundaries, active plans, and historical decisions should not live in one large file. Without placement rules, stale guidance accumulates and agents lose the shortest reliable read path.

## Decision Drivers

- Keep root and Tier 1 context small.
- Keep the package README consumer-facing and complete.
- Separate durable truth from active rollout context.
- Keep accepted decisions traceable.
- Put local ownership rules near the code when that reduces mistakes.

## Considered Options

- Keep documentation informal.
- Organize documentation only by topic.
- Adopt a durability gradient organized by audience, longevity, and ownership.

## Decision Outcome

Chosen option: "Adopt a durability gradient organized by audience, longevity, and ownership", because it gives maintainers and agents stable read paths while preserving the package README as the current documentation site.

### Consequences

- Good, because `AGENTS.md` stays a map rather than a manual.
- Good, because public usage stays in `packages/ngrx-rtk-query/README.md`.
- Good, because accepted decisions live in ADRs and active plans live in specs.
- Bad, because contributors must decide when information is durable enough to promote.

### Confirmation

The decision is confirmed when:

- `README.md` remains a symlink to `packages/ngrx-rtk-query/README.md`.
- `docs/*.md` files hold durable maintainer policy.
- `docs/adrs/` holds accepted decisions and an ADR template.
- `docs/specs/` holds active plans.
- `docs/agents/` is reserved for agent-only operational configuration.
- Entrypoint READMEs document local public surfaces.

## Pros and Cons of the Options

### Keep documentation informal

- Good, because it is fast for a single change.
- Bad, because it creates duplicate truth and stale instructions.
- Bad, because agents cannot infer which file owns a rule.

### Organize documentation only by topic

- Good, because topic grouping is familiar.
- Neutral, because it can work while the repository is small.
- Bad, because topic grouping alone does not separate public docs, maintainer policy, accepted decisions, and active rollout state.

### Adopt a durability gradient organized by audience, longevity, and ownership

- Good, because every class of knowledge has one default home.
- Good, because durable docs can be checked mechanically.
- Good, because the package README can serve as full public documentation without becoming maintainer policy.
- Bad, because misplaced docs must be moved during reviews.

## More Information

- `docs/HARNESS.md`
- `docs/adrs/0001-adopt-harness-engineering-as-the-repository-operating-model.md`
- `packages/ngrx-rtk-query/README.md`
