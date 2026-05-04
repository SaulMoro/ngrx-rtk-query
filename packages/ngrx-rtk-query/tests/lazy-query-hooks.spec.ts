import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { provideNoopStoreApi } from 'ngrx-rtk-query/noop-store';

import { createPostsApi } from './helpers/create-posts-api';

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

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

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

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(screen.getByText('empty')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'load post' }));

    expect(await screen.findByText('lazyQueryStaticTriggerApi-post-1')).toBeInTheDocument();
    expect(screen.getByText('last arg 1')).toBeInTheDocument();
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

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

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

    const { rerender } = await render(HostComponent, {
      componentInputs: { activeId: 1 },
      providers: [provideNoopStoreApi(postsApi)],
    });

    await user.click(screen.getByRole('button', { name: 'load current' }));

    expect(await screen.findByText('lazyQueryRequiredInputTriggerApi-post-1')).toBeInTheDocument();

    await rerender({ componentInputs: { activeId: 2 } });
    await user.click(screen.getByRole('button', { name: 'load current' }));

    expect(await screen.findByText('lazyQueryRequiredInputTriggerApi-post-2')).toBeInTheDocument();
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

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(screen.getByText('empty')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'load posts' }));

    expect(await screen.findByText('lazyQuerySelectedFunctionPropertyApi-post')).toBeInTheDocument();
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

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

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

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

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

    await render(HostComponent, {
      componentInputs: { label: 'selected' },
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(screen.getByText('empty')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'load post' }));

    expect(await screen.findByText('selected:lazyQueryRequiredInputOptionsApi-post-1')).toBeInTheDocument();
  });

  test('reset clears the visible lazy query result', async () => {
    const postsApi = createPostsApi('lazyQueryResetApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postsQuery()">load posts</button>
        <button (click)="postsQuery.reset()">reset</button>
        <p>{{ postsQuery.data()?.[0]?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly postsQuery = postsApi.useLazyGetPostsQuery();
    }

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    await user.click(screen.getByRole('button', { name: 'load posts' }));

    expect(await screen.findByText('lazyQueryResetApi-post')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'reset' }));

    await waitFor(() => {
      expect(screen.getByText('empty')).toBeInTheDocument();
    });
  });

  test('can prefer a cached value when triggering a cached lazy query', async () => {
    const postsApi = createPostsApi('lazyQueryPreferCacheValueApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postQuery(1)">load post</button>
        <button (click)="postQuery(1, { preferCacheValue: true })">load cached post</button>
        <p>{{ postQuery.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly postQuery = postsApi.useLazyGetPostQuery();
    }

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    await user.click(screen.getByRole('button', { name: 'load post' }));

    expect(await screen.findByText('lazyQueryPreferCacheValueApi-post-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'load cached post' }));

    expect(await screen.findByText('lazyQueryPreferCacheValueApi-post-1')).toBeInTheDocument();
  });
});
