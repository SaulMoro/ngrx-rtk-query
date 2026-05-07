---
status: accepted
date: 2026-05-07
---

# Keep the Package README as the Public Documentation Source

## Context and Problem Statement

The repository does not currently have a separate documentation website. The root `README.md` is a symlink to `packages/ngrx-rtk-query/README.md`, which is also the package README published to npm. Consumers need one complete usage document for installation, runtimes, hooks, examples, and troubleshooting.

## Decision Drivers

- Serve users from the artifact they already see on GitHub and npm.
- Avoid creating a second public documentation source before there is a website.
- Keep maintainer-only workflow policy out of public consumer docs.
- Preserve the root README symlink contract.

## Considered Options

- Split public documentation between root README and package README.
- Move complete public documentation to a new docs site now.
- Keep `packages/ngrx-rtk-query/README.md` as the canonical public documentation source.

## Decision Outcome

Chosen option: "Keep `packages/ngrx-rtk-query/README.md` as the canonical public documentation source", because it matches the current symlink and package publication model while giving users a single complete entrypoint.

### Consequences

- Good, because GitHub root, package source, and npm all show the same public docs.
- Good, because internal maintainer policy can move to `docs/*.md` without leaking into consumer docs.
- Good, because a future docs site can be generated from or aligned with the package README.
- Bad, because the README will be long until a dedicated documentation site exists.

### Confirmation

The decision is confirmed when:

- `README.md` points to `packages/ngrx-rtk-query/README.md`.
- The package README covers the full public usage contract.
- Internal workflow docs link to the README only when referring to public behavior.
- `tools/verify/check-docs.mjs` checks the symlink and required README sections.

## Pros and Cons of the Options

### Split public documentation between root README and package README

- Good, because root onboarding and package documentation could be tailored separately.
- Bad, because the current symlink makes this impossible without changing publication expectations.
- Bad, because consumers would have to discover which README is authoritative.

### Move complete public documentation to a new docs site now

- Good, because a site can provide stronger navigation.
- Neutral, because this may still be useful later.
- Bad, because it is a larger project than the current repo-harness adaptation.
- Bad, because npm would still need a useful README.

### Keep `packages/ngrx-rtk-query/README.md` as the canonical public documentation source

- Good, because it is the smallest durable contract that serves users now.
- Good, because it keeps public and internal documentation ownership clear.
- Bad, because the README carries more content than it ideally would after a docs site exists.

## More Information

- `README.md`
- `packages/ngrx-rtk-query/README.md`
- `docs/HARNESS.md`
