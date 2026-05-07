# ngrx-rtk-query/store

NgRx Store runtime secondary entrypoint.

## Public Surface

- `provideStoreApi(api)`
- `provideStoreApi(api, { setupListeners: false })`

Use this entrypoint when the Angular application already uses NgRx Store or wants Redux DevTools visibility for RTK Query state.

## Runtime Contract

Install `@ngrx/store` and provide the store before mounting the API:

```ts
import { provideStore } from '@ngrx/store';

import { provideStoreApi } from 'ngrx-rtk-query/store';

providers: [provideStore(), provideStoreApi(api)];
```

Each API instance must be mounted once. Do not mount the same API instance through `store`, `noop-store`, and `signal-store` hosts at the same time.

## Validation

Run `pnpm nx run ngrx-rtk-query:test` for provider behavior and `pnpm nx run basic-ngrx-store:test` for consumer-style coverage when this runtime changes.
