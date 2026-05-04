import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { skipToken } from 'ngrx-rtk-query/core';
import { provideNoopStoreApi } from 'ngrx-rtk-query/noop-store';

import { createDeferredPostsApi, createPostsApi } from './helpers/create-posts-api';

describe('query hooks', () => {
  test('loads a query from a static arg', async () => {
    const postsApi = createPostsApi('queryStaticArgApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p>{{ postQuery.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly postQuery = postsApi.useGetPostQuery(1);
    }

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(await screen.findByText('queryStaticArgApi-post-1')).toBeInTheDocument();
  });

  test('tracks a query arg from a signal', async () => {
    const postsApi = createPostsApi('querySignalArgApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="activeId.set(2)">next</button>
        <p>{{ postQuery.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly activeId = signal(1);
      readonly postQuery = postsApi.useGetPostQuery(this.activeId);
    }

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(await screen.findByText('querySignalArgApi-post-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'next' }));

    expect(await screen.findByText('querySignalArgApi-post-2')).toBeInTheDocument();
  });

  test('tracks a query arg from a function', async () => {
    const postsApi = createPostsApi('queryFunctionArgApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="activeId.set(2)">next</button>
        <p>{{ postQuery.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly activeId = signal(1);
      readonly postQuery = postsApi.useGetPostQuery(() => this.activeId());
    }

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(await screen.findByText('queryFunctionArgApi-post-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'next' }));

    expect(await screen.findByText('queryFunctionArgApi-post-2')).toBeInTheDocument();
  });

  test('tracks a query arg from required inputs', async () => {
    const postsApi = createPostsApi('queryRequiredInputArgApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p>{{ postQuery.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly activeId = input.required<number>();
      readonly postQuery = postsApi.useGetPostQuery(() => this.activeId());
    }

    const { rerender } = await render(HostComponent, {
      componentInputs: { activeId: 1 },
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(await screen.findByText('queryRequiredInputArgApi-post-1')).toBeInTheDocument();

    await rerender({ componentInputs: { activeId: 2 } });

    expect(await screen.findByText('queryRequiredInputArgApi-post-2')).toBeInTheDocument();
  });

  test('skips a query through skipToken until the arg is available', async () => {
    const postsApi = createPostsApi('querySkipTokenArgApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="enabled.set(true)">enable</button>
        <p>{{ postQuery.data()?.name ?? (postQuery.isUninitialized() ? 'skipped' : 'empty') }}</p>
      `,
    })
    class HostComponent {
      readonly enabled = signal(false);
      readonly postQuery = postsApi.useGetPostQuery(() => (this.enabled() ? 1 : skipToken));
    }

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(screen.getByText('skipped')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'enable' }));

    expect(await screen.findByText('querySkipTokenArgApi-post-1')).toBeInTheDocument();
  });

  test('exposes selected query result keys that collide with signal function properties', async () => {
    const postsApi = createPostsApi('querySelectedFunctionPropertyApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p>{{ postQuery.name() }}</p>
      `,
    })
    class HostComponent {
      readonly postQuery = postsApi.useGetPostsQuery(undefined, {
        selectFromResult: ({ data }) => ({
          name: data?.[0]?.name ?? 'empty',
        }),
      });
    }

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(await screen.findByText('querySelectedFunctionPropertyApi-post')).toBeInTheDocument();
  });

  test('keeps the query signal value limited to the selected query result', async () => {
    const postsApi = createPostsApi('querySelectedResultContractApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p>{{ postQuery.selectedName() }}</p>
      `,
    })
    class HostComponent {
      readonly postQuery = postsApi.useGetPostsQuery(undefined, {
        selectFromResult: ({ data }) => ({
          selectedName: data?.[0]?.name ?? 'empty',
        }),
      });
    }

    const { fixture } = await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(await screen.findByText('querySelectedResultContractApi-post')).toBeInTheDocument();

    const result = fixture.componentInstance.postQuery();
    expect(Reflect.has(result, 'selectedName')).toBe(true);
    expect(Reflect.has(result, 'isLoading')).toBe(false);
    expect(Reflect.has(result, 'data')).toBe(false);
  });

  test('exposes base query flags as fine-grained signals when selectFromResult returns them', async () => {
    const { postsApi, resolvePosts } = createDeferredPostsApi('querySelectedBaseFlagsApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p>{{ postQuery.selectedName() }}</p>
        <p>{{ postQuery.isLoading() ? 'loading' : 'not loading' }}</p>
        <p>{{ postQuery.isFetching() ? 'fetching' : 'not fetching' }}</p>
      `,
    })
    class HostComponent {
      readonly postQuery = postsApi.useGetPostsQuery(undefined, {
        selectFromResult: ({ data, isFetching, isLoading }) => ({
          selectedName: data?.[0]?.name ?? 'empty',
          isFetching,
          isLoading,
        }),
      });
    }

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(await screen.findByText('loading')).toBeInTheDocument();
    expect(screen.getByText('fetching')).toBeInTheDocument();

    resolvePosts([{ id: 1, name: 'querySelectedBaseFlagsApi-post' }]);

    expect(await screen.findByText('querySelectedBaseFlagsApi-post')).toBeInTheDocument();
    expect(screen.getByText('not loading')).toBeInTheDocument();
    expect(screen.getByText('not fetching')).toBeInTheDocument();
  });

  test('tracks query options from a signal', async () => {
    const postsApi = createPostsApi('querySignalOptionsApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="skipped.set(false)">load</button>
        <p>{{ postQuery.data()?.name ?? (postQuery.isUninitialized() ? 'skipped' : 'empty') }}</p>
      `,
    })
    class HostComponent {
      readonly skipped = signal(true);
      readonly queryOptions = computed(() => ({ skip: this.skipped() }));
      readonly postQuery = postsApi.useGetPostQuery(1, this.queryOptions);
    }

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(screen.getByText('skipped')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'load' }));

    expect(await screen.findByText('querySignalOptionsApi-post-1')).toBeInTheDocument();
  });

  test('tracks query options from a function derived from component state', async () => {
    const postsApi = createPostsApi('queryFunctionOptionsApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="showName.set(false)">hide name</button>
        <p>{{ postQuery.selectedName() }}</p>
      `,
    })
    class HostComponent {
      readonly showName = signal(true);
      readonly postQuery = postsApi.useGetPostQuery(1, () => ({
        selectFromResult: ({ data }) => ({
          selectedName: this.showName() ? (data?.name ?? 'empty') : 'hidden',
        }),
      }));
    }

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(await screen.findByText('queryFunctionOptionsApi-post-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'hide name' }));

    expect(await screen.findByText('hidden')).toBeInTheDocument();
  });
});
