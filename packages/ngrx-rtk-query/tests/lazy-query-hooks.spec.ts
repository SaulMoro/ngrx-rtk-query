import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { createApi, fakeBaseQuery } from 'ngrx-rtk-query/core';

import {
  type Post,
  createCountingPostApi,
  createDeferred,
  createDeferredPostsApi,
  createFailingPostApi,
  createOptionalPostApi,
  createPostsApi,
} from './helpers/create-posts-api';
import { renderWithNoopStoreApi } from './helpers/render-with-noop-store-api';

describe('lazy query hooks', () => {
  test('starts without data until manually triggered', async () => {
    const postsApi = createPostsApi('lazyQueryInitialStateApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p>{{ postsQuery.data()?.[0]?.name ?? (postsQuery.isUninitialized() ? 'empty' : 'loaded') }}</p>
      `,
    })
    class HostComponent {
      readonly postsQuery = postsApi.useLazyGetPostsQuery();
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  test('loads data from a manual static trigger and exposes lastArg', async () => {
    const postsApi = createPostsApi('lazyQueryStaticTriggerApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postQuery(1)">load post</button>
        <p>{{ postQuery.data()?.name ?? 'empty' }}</p>
        <p>last arg {{ postQuery.lastArg() }}</p>
      `,
    })
    class HostComponent {
      readonly postQuery = postsApi.useLazyGetPostQuery();
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByText('empty')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'load post' }));

    expect(await screen.findByText('lazyQueryStaticTriggerApi-post-1')).toBeInTheDocument();
    expect(screen.getByText('last arg 1')).toBeInTheDocument();
  });

  test('trigger promise unwrap resolves with the loaded payload', async () => {
    const postsApi = createPostsApi('lazyQueryUnwrapApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="loadPost()">load post</button>
        <p data-testid="query-name">{{ postQuery.data()?.name ?? 'empty' }}</p>
        <p data-testid="unwrap-name">{{ unwrappedName() }}</p>
      `,
    })
    class HostComponent {
      readonly unwrappedName = signal('empty unwrap');
      readonly postQuery = postsApi.useLazyGetPostQuery();

      async loadPost() {
        const post = await this.postQuery(1).unwrap();
        this.unwrappedName.set(post.name);
      }
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'load post' }));

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('lazyQueryUnwrapApi-post-1');
      expect(screen.getByTestId('unwrap-name')).toHaveTextContent('lazyQueryUnwrapApi-post-1');
    });
  });

  test('aborting a lazy query trigger is idempotent and rejects unwrap with an abort error', async () => {
    const deferredPost = createDeferred<Post>('Lazy query abort');
    const postsApi = createApi({
      reducerPath: 'lazyQueryAbortApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPost: build.query<Post, number>({
          queryFn: async () => ({
            data: await deferredPost.promise,
          }),
        }),
      }),
    });
    const user = userEvent.setup();

    const getErrorName = (error: unknown) =>
      typeof error === 'object' && error !== null && 'name' in error && typeof error.name === 'string'
        ? error.name
        : 'unknown';

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="loadAndAbort()">load and abort</button>
        <p data-testid="error-name">{{ errorName() }}</p>
      `,
    })
    class HostComponent {
      readonly errorName = signal('none');
      readonly postQuery = postsApi.useLazyGetPostQuery();

      loadAndAbort() {
        const result = this.postQuery(1);
        result.abort();
        result.abort();
        void result.unwrap().catch((error: unknown) => {
          this.errorName.set(getErrorName(error));
        });
      }
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'load and abort' }));

    expect(await screen.findByText('AbortError')).toBeInTheDocument();
    deferredPost.resolve({ id: 1, name: 'ignored after abort' });
  });

  test('uses the current signal value when manually triggered', async () => {
    const postsApi = createPostsApi('lazyQuerySignalTriggerApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="activeId.set(2)">next</button>
        <button (click)="loadCurrent()">load current</button>
        <p>{{ postQuery.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly activeId = signal(1);
      readonly postQuery = postsApi.useLazyGetPostQuery();

      loadCurrent() {
        this.postQuery(this.activeId());
      }
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'next' }));
    await user.click(screen.getByRole('button', { name: 'load current' }));

    expect(await screen.findByText('lazyQuerySignalTriggerApi-post-2')).toBeInTheDocument();
  });

  test('uses required input values when manually triggered', async () => {
    const postsApi = createPostsApi('lazyQueryRequiredInputTriggerApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="loadCurrent()">load current</button>
        <p>{{ postQuery.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly activeId = input.required<number>();
      readonly postQuery = postsApi.useLazyGetPostQuery();

      loadCurrent() {
        this.postQuery(this.activeId());
      }
    }

    const { rerender } = await renderWithNoopStoreApi(HostComponent, postsApi, {
      componentInputs: { activeId: 1 },
    });

    await user.click(screen.getByRole('button', { name: 'load current' }));

    expect(await screen.findByText('lazyQueryRequiredInputTriggerApi-post-1')).toBeInTheDocument();

    await rerender({ componentInputs: { activeId: 2 } });
    await user.click(screen.getByRole('button', { name: 'load current' }));

    expect(await screen.findByText('lazyQueryRequiredInputTriggerApi-post-2')).toBeInTheDocument();
  });

  test('accepts undefined when manually triggering an endpoint that accepts it', async () => {
    const postsApi = createOptionalPostApi('lazyQueryUndefinedArgApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postQuery(undefined)">load optional post</button>
        <p>{{ postQuery.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly postQuery = postsApi.useLazyGetOptionalPostQuery();
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'load optional post' }));

    expect(await screen.findByText('lazyQueryUndefinedArgApi-undefined-arg')).toBeInTheDocument();
  });

  test('exposes lazy query errors without reporting success', async () => {
    const postsApi = createFailingPostApi('lazyQueryErrorApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postQuery(1)">load post</button>
        <p>{{ postQuery.isError() ? 'error' : 'not error' }}</p>
        <p>{{ postQuery.isSuccess() ? 'success' : 'not success' }}</p>
      `,
    })
    class HostComponent {
      readonly postQuery = postsApi.useLazyGetPostQuery();
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByText('not error')).toBeInTheDocument();
    expect(screen.getByText('not success')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'load post' }));

    expect(await screen.findByText('error')).toBeInTheDocument();
    expect(screen.getByText('not success')).toBeInTheDocument();
  });

  test('exposes selected lazy query result keys that collide with trigger function properties', async () => {
    const postsApi = createPostsApi('lazyQuerySelectedFunctionPropertyApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postsQuery()">load posts</button>
        <p>{{ postsQuery.name() }}</p>
      `,
    })
    class HostComponent {
      readonly postsQuery = postsApi.useLazyGetPostsQuery({
        selectFromResult: ({ data }) => ({
          name: data?.[0]?.name ?? 'empty',
        }),
      });
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByText('empty')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'load posts' }));

    expect(await screen.findByText('lazyQuerySelectedFunctionPropertyApi-post')).toBeInTheDocument();
  });

  test('keeps the lazy query result properties limited to the selected query result', async () => {
    const postsApi = createPostsApi('lazyQuerySelectedResultContractApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postsQuery()">load posts</button>
        <p>{{ postsQuery.selectedName() }}</p>
      `,
    })
    class HostComponent {
      readonly postsQuery = postsApi.useLazyGetPostsQuery({
        selectFromResult: ({ data }) => ({
          selectedName: data?.[0]?.name ?? 'empty',
        }),
      });
    }

    const { fixture } = await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByText('empty')).toBeInTheDocument();
    expect(Reflect.has(fixture.componentInstance.postsQuery, 'selectedName')).toBe(true);
    expect(Reflect.has(fixture.componentInstance.postsQuery, 'isLoading')).toBe(false);
    expect(Reflect.has(fixture.componentInstance.postsQuery, 'data')).toBe(false);

    await user.click(screen.getByRole('button', { name: 'load posts' }));

    expect(await screen.findByText('lazyQuerySelectedResultContractApi-post')).toBeInTheDocument();
    expect(Reflect.has(fixture.componentInstance.postsQuery, 'selectedName')).toBe(true);
    expect(Reflect.has(fixture.componentInstance.postsQuery, 'isLoading')).toBe(false);
    expect(Reflect.has(fixture.componentInstance.postsQuery, 'data')).toBe(false);
  });

  test('exposes base lazy query flags as fine-grained signals when selectFromResult returns them', async () => {
    const { postsApi, resolvePosts } = createDeferredPostsApi('lazyQuerySelectedBaseFlagsApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postsQuery()">load posts</button>
        <p>{{ postsQuery.selectedName() }}</p>
        <p>{{ postsQuery.isLoading() ? 'loading' : 'not loading' }}</p>
        <p>{{ postsQuery.isFetching() ? 'fetching' : 'not fetching' }}</p>
      `,
    })
    class HostComponent {
      readonly postsQuery = postsApi.useLazyGetPostsQuery({
        selectFromResult: ({ data, isFetching, isLoading }) => ({
          selectedName: data?.[0]?.name ?? 'empty',
          isFetching,
          isLoading,
        }),
      });
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByText('empty')).toBeInTheDocument();
    expect(screen.getByText('not loading')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'load posts' }));

    expect(await screen.findByText('loading')).toBeInTheDocument();
    expect(screen.getByText('fetching')).toBeInTheDocument();

    resolvePosts([{ id: 1, name: 'lazyQuerySelectedBaseFlagsApi-post' }]);

    expect(await screen.findByText('lazyQuerySelectedBaseFlagsApi-post')).toBeInTheDocument();
    expect(screen.getByText('not loading')).toBeInTheDocument();
    expect(screen.getByText('not fetching')).toBeInTheDocument();
  });

  test('exposes falsy values returned by lazy selectFromResult', async () => {
    const postsApi = createPostsApi('lazyQuerySelectedFalsyApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postsQuery()">load posts</button>
        <p data-testid="selected-count">{{ postsQuery.selectedCount() }}</p>
        <p data-testid="selected-many">{{ postsQuery.hasMany() ? 'many' : 'not many' }}</p>
      `,
    })
    class HostComponent {
      readonly postsQuery = postsApi.useLazyGetPostsQuery({
        selectFromResult: ({ data }) => ({
          selectedCount: data ? data.length - 1 : -1,
          hasMany: data ? data.length > 1 : true,
        }),
      });
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'load posts' }));

    await waitFor(() => {
      expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
      expect(screen.getByTestId('selected-many')).toHaveTextContent('not many');
    });
  });

  test('tracks lazy query options from a signal', async () => {
    const postsApi = createPostsApi('lazyQuerySignalOptionsApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postsQuery()">load posts</button>
        <button (click)="showName.set(false)">hide name</button>
        <p>{{ postsQuery.selectedName() }}</p>
      `,
    })
    class HostComponent {
      readonly showName = signal(true);
      readonly queryOptions = computed(() => ({
        selectFromResult: ({ data }: { data?: { name: string }[] }) => ({
          selectedName: this.showName() ? (data?.[0]?.name ?? 'empty') : 'hidden',
        }),
      }));
      readonly postsQuery = postsApi.useLazyGetPostsQuery(this.queryOptions);
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'load posts' }));

    expect(await screen.findByText('lazyQuerySignalOptionsApi-post')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'hide name' }));

    expect(await screen.findByText('hidden')).toBeInTheDocument();
  });

  test('tracks lazy query options from a function derived from component state', async () => {
    const postsApi = createPostsApi('lazyQueryFunctionOptionsApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postsQuery()">load posts</button>
        <button (click)="showName.set(false)">hide name</button>
        <p>{{ postsQuery.selectedName() }}</p>
      `,
    })
    class HostComponent {
      readonly showName = signal(true);
      readonly postsQuery = postsApi.useLazyGetPostsQuery(() => ({
        selectFromResult: ({ data }) => ({
          selectedName: this.showName() ? (data?.[0]?.name ?? 'empty') : 'hidden',
        }),
      }));
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'load posts' }));

    expect(await screen.findByText('lazyQueryFunctionOptionsApi-post')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'hide name' }));

    expect(await screen.findByText('hidden')).toBeInTheDocument();
  });

  test('supports function-based lazy query options derived from required inputs', async () => {
    const postsApi = createPostsApi('lazyQueryRequiredInputOptionsApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postQuery(1)">load post</button>
        <p>{{ postQuery.selectedName() }}</p>
      `,
    })
    class HostComponent {
      readonly label = input.required<string>();
      readonly postQuery = postsApi.useLazyGetPostQuery(() => ({
        selectFromResult: ({ data }) => ({
          selectedName: data ? `${this.label()}:${data.name}` : 'empty',
        }),
      }));
    }

    await renderWithNoopStoreApi(HostComponent, postsApi, {
      componentInputs: { label: 'selected' },
    });

    expect(screen.getByText('empty')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'load post' }));

    expect(await screen.findByText('selected:lazyQueryRequiredInputOptionsApi-post-1')).toBeInTheDocument();
  });

  test('reset clears the visible lazy query result and preserves lastArg', async () => {
    const postsApi = createPostsApi('lazyQueryResetApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postQuery(1)">load post</button>
        <button (click)="postQuery.reset()">reset</button>
        <p>{{ postQuery.data()?.name ?? 'empty' }}</p>
        <p>last arg {{ postQuery.lastArg() }}</p>
      `,
    })
    class HostComponent {
      readonly postQuery = postsApi.useLazyGetPostQuery();
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'load post' }));

    expect(await screen.findByText('lazyQueryResetApi-post-1')).toBeInTheDocument();
    expect(screen.getByText('last arg 1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'reset' }));

    await waitFor(() => {
      expect(screen.getByText('empty')).toBeInTheDocument();
      expect(screen.getByText('last arg 1')).toBeInTheDocument();
    });
  });

  test('can prefer a cached value without forcing another fetch', async () => {
    const { postsApi, getFetchCount } = createCountingPostApi('lazyQueryPreferCacheValueApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postQuery(1)">load post</button>
        <button (click)="loadCachedPost()">load cached post</button>
        <p>{{ postQuery.data()?.name ?? 'empty' }}</p>
        <p data-testid="cached-loads">{{ cachedLoads() }}</p>
      `,
    })
    class HostComponent {
      readonly cachedLoads = signal(0);
      readonly postQuery = postsApi.useLazyGetPostQuery();

      async loadCachedPost() {
        await this.postQuery(1, { preferCacheValue: true });
        this.cachedLoads.update((value) => value + 1);
      }
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'load post' }));

    expect(await screen.findByText('lazyQueryPreferCacheValueApi-post-1')).toBeInTheDocument();
    expect(getFetchCount()).toBe(1);

    await user.click(screen.getByRole('button', { name: 'load cached post' }));

    await waitFor(() => {
      expect(screen.getByTestId('cached-loads')).toHaveTextContent('1');
      expect(screen.getByText('lazyQueryPreferCacheValueApi-post-1')).toBeInTheDocument();
      expect(getFetchCount()).toBe(1);
    });
  });
});
