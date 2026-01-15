---
"ngrx-rtk-query": major
---

### Breaking Changes

- Updated to Angular 21 and Nx 21
- Library version now aligned with Angular major version (21.x)

### Features

- **Infinite Queries**: Added `refetchCachedPages` option synced with RTK Query 2.11
  - Allows refetching all cached pages when the cache entry is invalidated
  - Can be set at hook level or per-call basis

### Fixes

- Fixed query state types for `exactOptionalPropertyTypes` TypeScript compatibility

### Documentation

- Added comprehensive AGENTS.md for AI agent guidance
- Added documentation and examples for infinite queries
- Improved README with infinite query usage examples

### Internal

- Updated CI workflows to use Node.js 22
- Updated GitHub Actions versions
- Refactored code structure for improved readability and maintainability
