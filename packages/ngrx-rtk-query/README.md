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

**ngrx-rtk-query** is a plugin to make RTK Query (**including auto-generated hooks**) works in Angular applications with NgRx!! Mix the power of RTK Query + NgRx + **Signals** to achieve the same functionality as in the [RTK Query guide with hooks](https://redux-toolkit.js.org/rtk-query/overview).

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Installation](#installation)
  - [Versions](#versions)
- [Basic Usage](#basic-usage)
- [Usage with HttpClient or injectable service](#usage-with-httpclient-or-injectable-service)
- [Usage](#usage)
  - [**Queries**](#queries)
  - [**Lazy Queries**](#lazy-queries)
  - [**Mutations**](#mutations)
  - [**Code-splitted/Lazy feature/Lazy modules**](#code-splittedlazy-featurelazy-modules)
- [FAQ](#faq)
- [Contributors ✨](#contributors-)

## Installation

```bash
npm install ngrx-rtk-query
```

### Versions

| Angular / NgRx |   ngrx-rtk-query   | @reduxjs/toolkit |       Support       |
| :------------: | :----------------: | :--------------: | :-----------------: |
|      17.x      | >=17.3.x (signals) |      ~2.2.1      | Bugs / New Features |
|      17.x      | >=17.1.x (signals) |      ~2.2.1      |        Bugs         |
|      16.x      |   >=4.2.x (rxjs)   |      ~1.9.3      |    Critical bugs    |
|      15.x      |    4.1.x (rxjs)    |      1.9.3       |        None         |

Only the latest version of Angular in the table above is actively supported. This is due to the fact that compilation of Angular libraries is [incompatible between major versions](https://angular.io/guide/creating-libraries#ensuring-library-version-compatibility).

## Basic Usage

You can follow the official [RTK Query guide with hooks](https://redux-toolkit.js.org/rtk-query/overview), with slight variations.
You can see the application of this repository for more examples.

Start by importing createApi and defining an "API slice" that lists the server's base URL and which endpoints we want to interact with:

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

export const { useGetCountQuery, useIncrementCountMutation, useDecrementCountMutation } = counterApi;
```

Add the api to your store in your `app` or in a `lazy route`.

```typescript
import { provideStoreApi } from 'ngrx-rtk-query';
import { counterApi } from './route/to/counterApi.ts';

bootstrapApplication(AppComponent, {
  providers: [
    ...

    provideStoreApi(counterApi),
    // Or to disable setupListeners:
    // provideStoreApi(counterApi, { setupListeners: false })

    ...
  ],
}).catch((err) => console.error(err));
```

Use the query in a component

```ts
import { useDecrementCountMutation, useGetCountQuery, useIncrementCountMutation } from '@app/core/api';

@Component({
  selector: 'app-counter-manager',
  template: `
    <section>
      <button [disabled]="increment.isLoading()" (click)="increment(1)">+</button>

      <span>{{ countQuery.data()?.count ?? 0 }}</span>

      <button [disabled]="decrement.isLoading()" (click)="decrement(1)">-</button>
    </section>
  `,
})
export class CounterManagerComponent {
  countQuery = useGetCountQuery();
  increment = useIncrementCountMutation();
  decrement = useDecrementCountMutation();
}
```

<br/>

## Usage with HttpClient or injectable service

You can use the `fetchBaseQuery` function to create a base query that uses the Angular `HttpClient` to make requests or any injectable service. Basic HttpClient example:

```ts

const httpClientBaseQuery = fetchBaseQuery((http = inject(HttpClient), enviroment = inject(ENVIRONMENT)) => {
  return async (args, { signal }) => {
    const {
      url,
      method = 'get',
      body = undefined,
      params = undefined,
    } = typeof args === 'string' ? { url: args } : args;
    const fullUrl = `${enviroment.baseAPI}${url}`;

    const request$ = http.request(method, fullUrl, { body, params });
    try {
      const data = await lastValueFrom(request$);
      return { data };
    } catch (error) {
      return { error: { status: (error as HttpErrorResponse).status, data: (error as HttpErrorResponse).message } };
    }
  };
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery: httpClientBaseQuery,
//...

```

<br/>

## Usage

### **Queries**

The use of queries is a bit different compared to the original [Queries - RTK Query guide](https://redux-toolkit.js.org/rtk-query/usage/queries). You can look at the examples from this repository.

The parameters and options of the Query can be **signals** or static. You can update the signal to change the parameter/option.

The hook `useXXXQuery()` returns a signal with all the information indicated in the official documentation (including `refetch()` function). Can be used as an object with each of its properties acting like a signal. For example, 'isLoading' can be accessed as `xxxQuery.isLoading()` or `xxxQuery().isLoading()`. The first case offers a more fine-grained change detection.

```ts
// Use query without params or options
postsQuery = useGetPostsQuery();

// Use query with signals params or options (can be mixed with static)
postQuery = useGetPostsQuery(myArgSignal, myOptionsSignal);

// Use query with function (similar to a computed), detect changes in the function (can be mixed)
postQuery = useGetPostsQuery(
  () => id(),
  () => ({ skip: id() <= 5 }),
);

// Use query with static params or options (can be mixed)
postQuery = useGetPostsQuery(2, {
  selectFromResult: ({ data: post, isLoading }) => ({ post, isLoading }),
});
```

A good use case is to work with router inputs.

```ts
// ...
<span>{{ locationQuery.isLoading() }}</span>
<span>{{ locationQuery.data() }}</span>
// ...

export class CharacterCardComponent {
  characterParamId = input.required<number>();
  characterQuery = useGetCharacterQuery(this.characterParamId);

// ...
```

Another good use case is with signals inputs not required and use skipToken

```ts
// ...
<span>{{ locationQuery.data() }}</span>
// ...

export class CharacterCardComponent implements OnInit {
  character = input<Character | undefined>(undefined);
  locationQuery = useGetLocationQuery(() => this.character()?.currentLocation ?? skipToken);

// ...
```

### **Lazy Queries**

The use of lazy queries is a bit different compared to the original. As in the case of queries, the parameters and options of the Query can be signal or static. You can look at lazy feature example from this repository.

Like in the original library, a lazy query returns a object (not array) with each of its properties acting like a signal.

```ts
// Use query without options
postsQuery = useLazyGetPostsQuery();
// Use query with signal options
options = signal(...);
postQuery = useLazyGetPostsQuery(options);
// Use query with static options
postQuery = useLazyGetPostsQuery({
  selectFromResult: ({ data: post, isLoading }) => ({ post, isLoading }),
});
```

Use when data needs to be loaded on demand

```ts
//...
<span>{{ xxxQuery.data() }}</span>
<span>{{ xxxQuery.lastArg() }}</span>
//...

export class XxxComponent {
  xxxQuery = useLazyGetXxxQuery();

// ...
  xxx(id: string) {
    this.xxxQuery(id).unwrap();
  }
// ...
```

Another use case is to work with nested or relational data.

> [!TIP]
> We advise using 'query' instead of 'lazy query' for these cases for more declarative code.

```ts
<span>{{ locationQuery.data() }}</span>

export class CharacterCardComponent implements OnInit {
  character = input.required<Character>();
  locationQuery = useLazyGetLocationQuery();

  ngOnInit(): void {
    this.locationQuery(this.character().currentLocation, { preferCacheValue: true });
  }

// ...
```

`preferCacheValue` is `false` by default. When `true`, if the request exists in cache, it will not be dispatched again.
Perfect for ngOnInit cases. You can look at pagination feature example from this repository.

### **Mutations**

The use of mutations is a bit different compared to the original [Mutations - RTK Query guide](https://redux-toolkit.js.org/rtk-query/usage/mutations). You can look at the examples from this repository.

Like in the original library, a mutation is a object (not array) with each of its properties acting like a signal.

```ts
// Use mutation hook
addPost = useAddPostMutation();

// Mutation trigger
this.addPost({ params });

// Can unwrap the mutation to do a action

this.addPost({ params })
  .unwrap()
  .then((data) => {
    // Do something with data
  })
  .catch((error) => {
    // Do something with error
  });

// Or

try {
  const data = await this.addPost({ params }).unwrap();
  // Do something with data
} catch (error) {
  // Do something with error
}

// Signal with the state of mutation to use in the template or component (isLoading, data, error, isSuccess, etc)
addPost.isLoading();
addPost.data();
```

### **Code-splitted/Lazy feature/Lazy modules**

**Important:** Only for cases with differents base API url. **With same base API url, it's preferable to use [code splitting](https://redux-toolkit.js.org/rtk-query/usage/code-splitting)**

To introduce a lazy/feature/code-splitted query, you must export it through an angular mule.
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

import { provideStoreApi } from 'ngrx-rtk-query';

// ...
  providers: [
    // ...
    provideStoreApi(postsApi),
    // ...
  ],
// ...
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
