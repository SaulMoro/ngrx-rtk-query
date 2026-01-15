# AGENTS.md

Guidance for AI agents working with this repository.

## Repository Overview

**ngrx-rtk-query** is an Angular library that wraps RTK Query (Redux Toolkit Query) for Angular using Signals. It bridges RTK Query's React-centric hooks to Angular's component model.

- Signal-based reactivity (not RxJS)
- Auto-generated hooks from API definitions (`useXxxQuery`, `useLazyXxxQuery`, `useXxxMutation`)
- Works with or without NgRx Store (`provideStoreApi` vs `provideNoopStoreApi`)
- Library versions align with Angular major versions (e.g., ngrx-rtk-query 21.x -> Angular 21.x)

## Quick Start

```bash
# Prerequisites: Node ^18.18.0 || ^20.0.0 || ^22.0.0, pnpm ^10.0.0

pnpm install

# Run examples
pnpm dev:basic-store      # NgRx store example
pnpm dev:noop-store       # Noop store example (no NgRx)
```

## Essential Commands

```bash
# Development
pnpm dev:basic-store         # Start NgRx store example
pnpm dev:noop-store          # Start noop store example
pnpm build:ngrx-rtk-query    # Build library

# Quality
pnpm affected:check          # Lint + type-check + format
pnpm affected:test           # Run tests
pnpm affected:e2e            # Run E2E tests

# Changesets (release happens via GitHub Actions)
pnpm changeset               # Create changeset for version bump
```

## Architecture

### Library Structure (ng-packagr secondary entry points)

```
packages/ngrx-rtk-query/
├── index.ts                 # Re-exports core + store
├── core/                    # Core functionality (no store dependency)
│   └── src/
│       ├── create-api.ts    # Main createApi function
│       ├── fetch-base-query.ts  # Angular-compatible fetchBaseQuery
│       ├── build-hooks.ts   # Hook generation logic
│       ├── module.ts        # Angular hooks module for RTK Query
│       ├── types/           # TypeScript types for hooks
│       └── utils/           # Signal utilities (signalProxy, toLazySignal)
├── store/                   # NgRx Store integration
│   └── src/provide-store-api.ts
├── noop-store/              # Standalone store (no NgRx dependency)
│   └── src/provide-noop-store-api.ts
└── signal-store/            # Reserved for future @ngrx/signals integration
```

### Import Paths

```typescript
// With NgRx Store
import { createApi, fetchBaseQuery, provideStoreApi } from 'ngrx-rtk-query';

// Without NgRx Store
import { createApi, fetchBaseQuery } from 'ngrx-rtk-query/core';
import { provideNoopStoreApi } from 'ngrx-rtk-query/noop-store';
```

### Core Abstractions

#### `createApi` (core/create-api.ts)

Wraps RTK Query's `buildCreateApi` with Angular-specific hooks module.

#### `fetchBaseQuery` (core/fetch-base-query.ts)

Supports Angular DI via factory function:

```typescript
fetchBaseQuery((http = inject(HttpClient)) => async (args, api) => {
  /* ... */
});
```

#### Hook System (core/build-hooks.ts)

Generates: `useXxxQuery()`, `useLazyXxxQuery()`, `useXxxMutation()`, `useXxxInfiniteQuery()`

#### Signal Proxy (core/utils/signal-proxy.ts)

Enables fine-grained signal access:

```typescript
query.isLoading(); // Better than query().isLoading for change detection
```

### Store Variants

**With NgRx Store:**

```typescript
providers: [provideStore(), provideStoreDevtools({ name: 'App' }), provideStoreApi(postsApi)];
```

**Without NgRx Store:**

```typescript
providers: [provideNoopStoreApi(postsApi)];
```

## Usage Patterns

### Query with Signal Inputs

```typescript
userQuery = useGetUserQuery(this.userId); // Signal input
userQuery = useGetUserQuery(() => this.userId()); // Function
locationQuery = useGetLocationQuery(() => id ?? skipToken); // Conditional
```

### Lazy Queries

```typescript
xxxQuery = useLazyGetXxxQuery();
this.xxxQuery(id).unwrap();
this.xxxQuery(id, { preferCacheValue: true });
this.xxxQuery.reset();
```

### Mutations

```typescript
addPost = useAddPostMutation();
this.addPost({ name: 'New' }).unwrap().then(/* ... */);
addPost.isLoading(); // Template usage
```

## Code Style

- **Type imports**: `import { type Signal } from '@angular/core';`
- **Private members**: Use `#` prefix
- **Files**: kebab-case
- **Hooks**: `use` prefix + PascalCase endpoint name
- **Components**: Standalone, OnPush, inline templates

## Debugging

### Common Errors

| Error                          | Solution                                                 |
| ------------------------------ | -------------------------------------------------------- |
| "Provide the API is necessary" | Add `provideStoreApi(api)` or `provideNoopStoreApi(api)` |
| "Middleware not added"         | Add `provideStore()` before `provideStoreApi()`          |
| Query not refetching           | Ensure arg is signal/function, check `skip` option       |

### DevTools

With NgRx Store: Redux DevTools extension shows state under `reducerPath` key.

---

## Maintainer Workflows

### 1. Update Nx and Angular

When updating Angular/Nx versions:

```bash
# 1. Run Nx migration
pnpm update  # This runs 'nx migrate latest'

# 2. Review and apply migrations
cat migrations.json
nx migrate --run-migrations

# 3. Update Angular dependencies in package.json
# Update @angular/* packages to target version

# 4. Update library peer dependencies
# Edit packages/ngrx-rtk-query/package.json peerDependencies

# 5. Test both example apps
pnpm dev:basic-store
pnpm dev:noop-store
pnpm affected:test
pnpm affected:e2e

# 6. Create changeset with major version bump
pnpm changeset
```

### 2. Sync with RTK Query React Hooks

The library mirrors RTK Query's React hooks implementation. When updating RTK versions:

**MANDATORY CHECKLIST** (do not skip any step):

- [ ] Check RTK Query React commits since last synced version
- [ ] Compare `buildHooks.ts` for new features/options
- [ ] Compare `module.ts` for API changes
- [ ] Compare React hook types for new properties
- [ ] Update corresponding ngrx-rtk-query files
- [ ] Build and verify no type errors
- [ ] Test both example apps manually

**CRITICAL**: Types that are NOT in `build-hooks.ts` are in `types/hooks-types.ts`. When RTK changes types in `buildHooks.ts`, check BOTH files for corresponding changes.

**CRITICAL**: Review ALL commits, including:

- **Refactoring commits** (titles like "byte-shave", "cleanup", "deduplicate", "optimize")
- **Internal reorganization** (import path changes, code extraction)
- **Bundle size optimization** (string constants vs enums, dead code removal)

These commits often contain subtle behavioral changes mixed with non-functional changes. Do NOT skip a commit just because the title suggests "only optimization".

**SYNC POLICY**: Even pure refactoring changes SHOULD be synced when practical:

- **Variable caching** (e.g., `const endpointDefinitions = context.endpointDefinitions`) - Apply the same pattern
- **Helper function extraction** (e.g., `unsubscribePromiseRef()`) - Create Angular equivalent
- **Explanatory comments** (e.g., "This is the one place where...") - Copy verbatim if applicable
- **Type aliases** (e.g., `type UnsubscribePromiseRef = ...`) - Add to types file

Keeping code structure aligned with upstream makes future syncs easier and reduces drift.

**COMMON OVERSIGHT**: When a commit adds a new option (like `refetchCachedPages`):

1. Check if the option is **extracted** from hook options
2. Check if the option is **passed to initiate()** call
3. Check if the option has **merge logic** (per-call override of hook-level default)
4. Check if **JSDoc comments** were extended with additional context

A single feature addition often touches 4-5 places. Review the FULL diff, not just the obvious parts.

1. **Check RTK Query React commits**:
   <https://github.com/reduxjs/redux-toolkit/commits/master/packages/toolkit/src/query/react>

2. **Compare with last synced version**:
   - Check current `@reduxjs/toolkit` version in `package.json`
   - Review commits since that version in the RTK repo
   - Focus on files: `buildHooks.ts`, `module.ts`, types

3. **Key files to sync**:

   | RTK Query React                                          | ngrx-rtk-query                                          |
   | -------------------------------------------------------- | ------------------------------------------------------- |
   | `packages/toolkit/src/query/react/buildHooks.ts`         | `packages/ngrx-rtk-query/core/src/build-hooks.ts`       |
   | `packages/toolkit/src/query/react/buildHooks.ts` (types) | `packages/ngrx-rtk-query/core/src/types/hooks-types.ts` |
   | `packages/toolkit/src/query/react/module.ts`             | `packages/ngrx-rtk-query/core/src/module.ts`            |

4. **Adaptation notes**:
   - Replace React hooks (`useState`, `useEffect`) with Angular signals (`signal`, `effect`)
   - Replace `useSelector` with `store.selectSignal`
   - Replace React refs with object references `{ current: T }`
   - Adapt cleanup patterns from `useEffect` cleanup to `DestroyRef.onDestroy`

5. **Test thoroughly** after sync:

   ```bash
   pnpm build:ngrx-rtk-query
   pnpm affected:test
   pnpm dev:basic-store  # Manual verification
   pnpm dev:noop-store
   pnpm affected:e2e
   ```

---

## Example Apps

The `examples/` folder contains reference implementations that validate library functionality and serve as usage guides.

### Available Examples

| Example                | Description                               | Command                |
| ---------------------- | ----------------------------------------- | ---------------------- |
| `basic-ngrx-store`     | Full NgRx Store integration with DevTools | `pnpm dev:basic-store` |
| `basic-noop-store`     | Standalone usage without NgRx             | `pnpm dev:noop-store`  |
| `basic-ngrx-store-e2e` | Playwright E2E tests for ngrx variant     | `pnpm affected:e2e`    |
| `basic-noop-store-e2e` | Playwright E2E tests for noop variant     | `pnpm affected:e2e`    |

### Example Structure

```
examples/basic-ngrx-store/
├── src/
│   ├── app/
│   │   ├── app.component.ts      # Root component
│   │   ├── app.config.ts         # Providers (provideStore, provideStoreApi)
│   │   ├── app.routes.ts         # Lazy-loaded routes
│   │   └── posts/
│   │       ├── api.ts            # createApi + hook exports
│   │       ├── post.model.ts     # TypeScript interfaces
│   │       ├── posts-list.component.ts      # List with useQuery + useMutation
│   │       ├── posts-list.component.spec.ts # Vitest + Testing Library tests
│   │       └── post-details.component.ts    # Detail with signal input
│   ├── mocks/
│   │   ├── handlers.ts           # MSW request handlers
│   │   ├── browser.ts            # Browser MSW worker
│   │   └── node.ts               # Node MSW server (for tests)
│   └── main.ts                   # Bootstrap with MSW init
├── project.json                  # Nx project config
└── vite.config.ts                # Vitest configuration
```

### Key Patterns Demonstrated

#### API Definition (`posts/api.ts`)

```typescript
export const postsApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'http://api.localhost.com' }),
  tagTypes: ['Posts'],
  endpoints: (build) => ({
    getPosts: build.query<Post[], void>({
      query: () => ({ url: '/posts' }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Posts', id })), { type: 'Posts', id: 'LIST' }]
          : [{ type: 'Posts', id: 'LIST' }],
    }),
    addPost: build.mutation<Post, Partial<Post>>({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),
  }),
});
export const { useGetPostsQuery, useAddPostMutation } = postsApi;
```

#### Component with Query + Mutation (`posts-list.component.ts`)

```typescript
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (postsQuery.isLoading()) { <p>Loading...</p> }
    @if (postsQuery.data(); as posts) {
      @for (post of posts; track post.id) { ... }
    }
    <button [disabled]="addPost.isLoading()" (click)="addNewPost()">Add</button>
  `,
})
export class PostsListComponent {
  postsQuery = useGetPostsQuery();
  addPost = useAddPostMutation();

  addNewPost() {
    this.addPost({ name: 'New' }).unwrap().then(() => ...);
  }
}
```

#### Component with Signal Input (`post-details.component.ts`)

```typescript
export class PostDetailsComponent {
  id = input.required({ transform: numberAttribute }); // Route param
  postQuery = useGetPostQuery(this.id, { pollingInterval: 5000 });
  updateMutation = useUpdatePostMutation();
  deleteMutation = useDeletePostMutation();
}
```

#### MSW Mocking (`mocks/handlers.ts`)

Uses `@reduxjs/toolkit` `createEntityAdapter` for in-memory state:

```typescript
export const handlers = [
  http.get('http://api.localhost.com/posts', () => HttpResponse.json(selectAll(state))),
  http.post('http://api.localhost.com/posts', async ({ request }) => { ... }),
];
```

#### Unit Tests (`posts-list.component.spec.ts`)

```typescript
describe('PostsListComponent', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    server.resetHandlers();
    postsApi.dispatch(postsApi.util.resetApiState()); // Reset cache between tests
  });

  test('should show posts', async () => {
    await render(PostsListComponent, {
      providers: [provideStore(), provideStoreApi(postsApi)],
    });
    expect(await screen.findByRole('link', { name: /sample/i })).toBeInTheDocument();
  });
});
```

### Creating a New Example

1. **Generate with Nx**:

   ```bash
   nx g @nx/angular:application examples/my-example --standalone --routing
   ```

2. **Configure providers** in `app.config.ts`:

   ```typescript
   // For NgRx variant
   providers: [provideStore(), provideStoreDevtools({ name: 'My Example' }), provideStoreApi(myApi)];
   // For noop variant
   providers: [provideNoopStoreApi(myApi)];
   ```

3. **Add MSW mocking**:
   - Copy `mocks/` folder from existing example
   - Update `handlers.ts` with your API endpoints
   - Init MSW in `main.ts` for dev mode

4. **Add tests**:
   - Unit tests: `*.spec.ts` with Vitest + Testing Library
   - E2E tests: Create `my-example-e2e/` with Playwright

5. **Register in package.json** (optional convenience script):

   ```json
   "dev:my-example": "nx run my-example:serve -o"
   ```

### Modifying Examples

When adding features to examples:

1. **Update both variants** if the feature applies to both NgRx and noop stores
2. **Add corresponding tests** (unit and/or e2e)
3. **Update MSW handlers** if new API endpoints are needed
4. **Test the variant** with `pnpm dev:basic-store` or `pnpm dev:noop-store`
5. **Run affected checks**: `pnpm affected:check && pnpm affected:test`

### Difference Between Variants

| Aspect         | basic-ngrx-store                       | basic-noop-store        |
| -------------- | -------------------------------------- | ----------------------- |
| Store Provider | `provideStore()` + `provideStoreApi()` | `provideNoopStoreApi()` |
| DevTools       | Redux DevTools enabled                 | No DevTools             |
| Dependencies   | Requires `@ngrx/store`                 | No NgRx dependency      |
| Use Case       | Apps already using NgRx                | Lightweight / no NgRx   |

---

## Resources

- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [RTK Query React Source](https://github.com/reduxjs/redux-toolkit/tree/master/packages/toolkit/src/query/react)
- [Angular Signals](https://angular.dev/guide/signals)
- [Changelog](packages/ngrx-rtk-query/CHANGELOG.md)

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
