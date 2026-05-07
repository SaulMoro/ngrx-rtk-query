# ngrx-rtk-query/noop-store

Noop Store runtime secondary entrypoint.

## Public Surface

- `provideNoopStoreApi(api)`
- `provideNoopStoreApi(api, { setupListeners: false })`

Use this entrypoint when the Angular application does not use NgRx Store.

## Runtime Contract

Mount the API at the application root:

```ts
import { provideNoopStoreApi } from 'ngrx-rtk-query/noop-store';

providers: [provideNoopStoreApi(api)];
```

The Noop Store runtime owns the RTK Query store lifecycle internally. Each API instance must still be mounted once.

## Validation

Run `pnpm nx run ngrx-rtk-query:test` for provider behavior and `pnpm nx run basic-noop-store:test` for consumer-style coverage when this runtime changes.
