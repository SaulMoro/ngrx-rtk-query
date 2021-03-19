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

**ngrx-rtk-query** is a plugin to make RTK Query (**including auto-generated hooks**) works in Angular applications with NgRx!! Mix the power of RTK Query + NgRx + RxJS to achieve the same functionality as in the RTK Query guide with Hooks.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Usage](#usage)
- [FAQ](#faq)

## Installation

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
    StoreRtkQueryModule.forRoot({ setupListeners: true })
  ],
})
class AppModule {}
```

## Basic Usage

You can follow the official [RTK Query guide with hooks](https://rtk-query-docs.netlify.app/introduction/getting-started), with slight variations.

You can see the application of this repository for more examples.

First, you need to install redux-toolkit and rtk-query:
```bash
npm install @reduxjs/toolkit rtk-incubator/rtk-query#next
```

We'll create a service definition that queries the publicly available

```ts
import { fetchBaseQuery } from '@rtk-incubator/rtk-query';
import { createApi } from 'ngrx-rtk-query';

export interface CountResponse {
  count: number;
}

export const counterApi = createApi({
  reducerPath: 'counterApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  entityTypes: ['Counter'],
  endpoints: (build) => ({
    getCount: build.query<CountResponse, void>({
      query: () => ({
        url: `count`,
      }),
      provides: ['Counter'],
    }),
    incrementCount: build.mutation<CountResponse, number>({
      query: (amount) => ({
        url: `increment`,
        method: 'PUT',
        body: { amount },
      }),
      invalidates: ['Counter'],
    }),
    decrementCount: build.mutation<CountResponse, number>({
      query: (amount) => ({
        url: `decrement`,
        method: 'PUT',
        body: { amount },
      }),
      invalidates: ['Counter'],
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
Import this module where needed. You can look at the example of posts from this repository.

```ts
// ...

export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: baseQueryWithRetry,
  entityTypes: ['Posts'],
  endpoints: (build) => ({
    // ...
  }),
});

export const {
  // ...
} = postsApi;

@NgModule({
  imports: [StoreModule.forFeature(postsApi.reducerPath, postsApi.reducer, { metaReducers: [postsApi.metareducer] })],
})
export class PostsQueryModule {}
```

<br/>

### Mutations

The use of mutations is a bit different compared to the original [RTK Query guide with hooks](https://rtk-query-docs.netlify.app/introduction/getting-started)

Like in the original library, a mutation is a tuple with two items, but the structure and naming of the items is different.
The first item is a function called **dispatch**. This function is the trigger to run the mutation action.
The second item is an observable that returns an object with the state, including the status flags: isUninitialized, isLoading, isSuccess, isError.

```typescript
  addPostMutation = useAddPostMutation();
  addPostMutation.dispatch({params}); //this is the mutation trigger
  addPostMutation.state$ //this is the observable with the state

```


## FAQ

### **I can't install rtk-incubator/rtk-query#next**

Until RTK Query releases the next version, you can install the same version as in the package.json of this repository

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