<p align="center">
 <img width="20%" height="20%" src="./logo.svg">
</p>

<br />

[![MIT](https://img.shields.io/packagist/l/doctrine/orm.svg?style=flat-square)]()
[![commitizen](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)]()
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)]()
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
[![ngneat-lib](https://img.shields.io/badge/made%20with-%40ngneat%2Flib-ad1fe3?logo=angular)](https://github.com/ngneat/lib)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

**ngrx-rtk-query** is a plugin to make RTK Query (**including auto-generated hooks**) works in Angular applications with NgRx!! Mix the power of RTK Query + NgRx + RxJS to achieve the same functionality as in the [RTK Query guide with hooks](https://redux-toolkit.js.org/rtk-query/overview).

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Usage](#usage)
- [FAQ](#faq)

## Installation

> ⚠️  ngrx-rtk-query library requires TypeScript 4.1 or higher.

### Versions

|   Angular / NgRx   | ngrx-rtk-query | @reduxjs/toolkit |       Support       |
| :----------------: | :------------: | :--------------: | :-----------------: |
|    15.x - 16.x     |     >=4.x      |      1.9.5       | Bugs / New Features |
|       >=13.x       |     3.5.x      |      1.9.1       |        None         |
|    11.x - 12.x     |     2.3.0      |      1.6.2       |        None         |

Only the latest version of Angular in the table above is actively supported. This is due to the fact that compilation of Angular libraries is [incompatible between major versions](https://angular.io/guide/creating-libraries#ensuring-library-version-compatibility).

You can install it through **Angular CLI**:

```bash
ng add ngrx-rtk-query
```

or with **npm**:

```bash
npm install ngrx-rtk-query
```

When you install using **npm or yarn**, you will also need to import `StoreRtkQueryModule` in your `app.module`. You can also set setupListeners here.:

```typescript
import { StoreRtkQueryModule } from 'ngrx-rtk-query';

@NgModule({
  imports: [
    ... // NgRx Modules here!!
    StoreRtkQueryModule.forRoot({ 
      setupListeners: true,
      baseUrl: environment.baseAPI, // Optional environment baseUrl
    })
  ],
})
class AppModule {}
```

New **Standalone provider** install !!

```typescript
import { provideStoreRtkQuery } from 'ngrx-rtk-query';

bootstrapApplication(AppComponent, {
  providers: [
    ...

    provideStoreRtkQuery({ 
      setupListeners: true,
      baseUrl: environment.baseAPI, // Optional environment baseUrl
    }),

    ...
  ],
}).catch((err) => console.error(err));
```

## Basic Usage

You can follow the official [RTK Query guide with hooks](https://redux-toolkit.js.org/rtk-query/overview), with slight variations.

You can see the application of this repository for more examples.

First, you need to install redux-toolkit:
```bash
npm install @reduxjs/toolkit
```

We'll create a service definition that queries the publicly available

```ts
import { createApi, fetchBaseQuery } from 'ngrx-rtk-query';

export interface CountResponse {
  count: number;
}

export const counterApi = createApi({
  reducerPath: 'counterApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['Counter'],
  endpoints: (build) => ({
    getCount: build.query<CountResponse, void>({
      query: () => ({
        url: `count`,
      }),
      providesTags: ['Counter'],
    }),
    incrementCount: build.mutation<CountResponse, number>({
      query: (amount) => ({
        url: `increment`,
        method: 'PUT',
        body: { amount },
      }),
      invalidatesTags: ['Counter'],
    }),
    decrementCount: build.mutation<CountResponse, number>({
      query: (amount) => ({
        url: `decrement`,
        method: 'PUT',
        body: { amount },
      }),
      invalidatesTags: ['Counter'],
    }),
  }),
});

export const {
  useGetCountQuery,
  useIncrementCountMutation,
  useDecrementCountMutation,
} = counterApi;
```

Add the service to your store

```ts
export const reducers: ActionReducerMap<RootState> = {
  [counterApi.reducerPath]: counterApi.reducer,
};

@NgModule({
  imports: [
    StoreModule.forRoot(reducers, {
      metaReducers: [counterApi.metareducer],
    }),
    StoreRtkQueryModule.forRoot({ setupListeners: true }),

    !environment.production ? StoreDevtoolsModule.instrument() : [],
  ],
})
export class CoreStoreModule {}
```

New **Standalone Api provider** !!

```typescript
import { provideStoreApi } from 'ngrx-rtk-query';

...
  providers: [
    ...

    provideStoreApi(counterApi),

    ...
  ],
...
```

Use the query in a component

```ts
import { useDecrementCountMutation, useGetCountQuery, useIncrementCountMutation } from '@app/core/services';

@Component({
  selector: 'app-counter-manager',
  template: `
    <section>
      <button
        *ngIf="increment.state$ | async as incrementState"
        [disabled]="incrementState.isLoading"
        (click)="increment.dispatch(1)"
      > + </button>

      <span *ngIf="countQuery$ | async as countQuery">{{ countQuery.data?.count || 0 }}</span>

      <button
        *ngIf="decrement.state$ | async as decrementState"
        [disabled]="decrementState.isLoading"
        (click)="decrement.dispatch(1)"
      > - </button>
    </section>
  `,
})
export class CounterManagerComponent {
  countQuery$ = useGetCountQuery();
  increment = useIncrementCountMutation();
  decrement = useDecrementCountMutation();
}
```
<br/>

## Usage

### **Use on code-splitted/feature/lazy modules**

To introduce a lazy/feature/code-splitted query, you must export it through an angular module.
Import this module where needed. You can look at posts feature example from this repository.

```ts
// ...

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: baseQueryWithRetry,
  tagTypes: ['Posts'],
  endpoints: (build) => ({
    // ...
  }),
});

// ...

@NgModule({
  imports: [StoreModule.forFeature(postsApi.reducerPath, postsApi.reducer, { metaReducers: [postsApi.metareducer] })],
})
export class PostsQueryModule {}

//
// OR 
// New Standalone Provider Api

import { provideStoreApi } from 'ngrx-rtk-query';

...
  providers: [
    ...

    provideStoreApi(postsApi),

    ...
  ],
...
```

### **Queries**

The use of queries is a bit different compared to the original [Queries - RTK Query guide](https://redux-toolkit.js.org/rtk-query/usage/queries). You can look at the examples from this repository.

The parameters and options of the Query can be static or Observables.

The hook `useXXXQuery()` returns an observable with all the information indicated in the official documentation (including `refetch()` function). By subscribing to this query (with the `async pipe` or `subscribe()`), the query will start its request.

```ts
// Use query without params or options
postsQuery$ = useGetPostsQuery();

// Use query with static params or options
postQuery$ = useGetPostsQuery(2, {
  selectFromResult: ({ data: post, isLoading }) => ({ post, isLoading }),
});

// Use query with Observables params or options (can be mixed with static)
postQuery$ = useGetPostsQuery(id$, options$);
```

### **Lazy Queries**

The use of lazy queries is a bit different compared to the original. As in the case of queries, the parameters and options of the Query can be static or Observables. You can look at lazy feature example from this repository.

Like in the original library, a lazy returns a object (not array) of 3 items, but the structure and naming of the items is different.

- `fetch(arg)`: This function is the trigger to run the fetch action.
- `state$`: Observable that returns an object with the query state.
- `lastArg$`: Observable that returns the last argument.

```ts
// Use query without options
postsQuery = useLazyGetPostsQuery();
// Use query with static options
postQuery = useLazyGetPostsQuery({
  selectFromResult: ({ data: post, isLoading }) => ({ post, isLoading }),
});
// Use query with Observable options
postQuery = useLazyGetPostsQuery(options$);
```

Use when data needs to be loaded on demand

```ts
<span *ngIf="xxxQuery.state$ | async as xxxQuery">{{ xxxQuery.data }}</span>
<span>{{ xxxQuery.lastArg$ | async }}</span>

//...

export class XxxComponent {
  xxxQuery = useLazyGetXxxQuery();

// ...

  xxx(id: string) {
    this.xxxQuery.fetch(id);
  }

// ...
```

Another good use case is to work with nested or relational data

```ts
<ng-container *ngIf="locationQuery.state$ | async as locationQuery">
//...
</ng-container>

export class CharacterCardComponent implements OnInit {
  @Input() character: Character;

  locationQuery = useLazyGetLocationQuery();

  ngOnInit(): void {
    this.locationQuery.fetch(this.character.currentLocation, { preferCacheValue: true });
  }

// ...
```

`preferCacheValue` is `false` by default. When `true`, if the request exists in cache, it will not be dispatched again.
Perfect for ngOnInit cases. You can look at pagination feature example from this repository.

### **Mutations**

The use of mutations is a bit different compared to the original [Mutations - RTK Query guide](https://redux-toolkit.js.org/rtk-query/usage/mutations). You can look at the examples from this repository.

Like in the original library, a mutation is a object (not array) of 2 items, but the structure and naming of the items is different.

- `dispatch(params)`: This function is the trigger to run the mutation action.
- `state$`: Observable that returns an object with the state, including the status flags and other info (see official docs).

```ts
// Use mutation hook
addPost = useAddPostMutation();

// Mutation trigger
addPost.dispatch({params});
// Observable with the state of mutation
addPost.state$
```

<br />

## FAQ

<br/>

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/SaulMoro"><img src="https://avatars.githubusercontent.com/u/4116819?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Saul Moro</b></sub></a><br /><a href="#question-SaulMoro" title="Answering Questions">💬</a> <a href="https://github.com/SaulMoro/ngrx-rtk-query/issues?q=author%3ASaulMoro" title="Bug reports">🐛</a> <a href="https://github.com/SaulMoro/ngrx-rtk-query/commits?author=SaulMoro" title="Code">💻</a> <a href="#content-SaulMoro" title="Content">🖋</a> <a href="#design-SaulMoro" title="Design">🎨</a> <a href="https://github.com/SaulMoro/ngrx-rtk-query/commits?author=SaulMoro" title="Documentation">📖</a> <a href="#basic-usage" title="Examples">💡</a> <a href="#ideas-SaulMoro" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-SaulMoro" title="Maintenance">🚧</a> <a href="#mentoring-SaulMoro" title="Mentoring">🧑‍🏫</a> <a href="#platform-SaulMoro" title="Packaging/porting to new platform">📦</a> <a href="#research-SaulMoro" title="Research">🔬</a> <a href="https://github.com/SaulMoro/ngrx-rtk-query/pulls?q=is%3Apr+reviewed-by%3ASaulMoro" title="Reviewed Pull Requests">👀</a> <a href="#basic-usage" title="Tutorials">✅</a></td>
    <td align="center"><a href="https://github.com/adrian-pena-castro"><img src="https://avatars.githubusercontent.com/u/80181162?v=4?s=100" width="100px;" alt=""/><br /><sub><b>adrian-pena-castro</b></sub></a><br /> <a href="https://github.com/SaulMoro/ngrx-rtk-query/issues?q=author%3Aadrian-pena-castro" title="Bug reports">🐛</a> <a href="https://github.com/SaulMoro/ngrx-rtk-query/commits?author=adrian-pena-castro" title="Code">💻</a> <a href="#content-adrian-pena-castro" title="Content">🖋</a> <a href="https://github.com/SaulMoro/ngrx-rtk-query/commits?author=adrian-pena-castro" title="Documentation">📖</a> <a href="#example-adrian-pena-castro" title="Examples">💡</a> <a href="#ideas-adrian-pena-castro" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-adrian-pena-castro" title="Maintenance">🚧</a> <a href="#translation-adrian-pena-castro" title="Translation">🌍</a> <a href="#tutorial-adrian-pena-castro" title="Tutorials">✅</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

<div>Icons made by <a href="http://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
