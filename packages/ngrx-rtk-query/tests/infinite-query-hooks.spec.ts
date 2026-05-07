import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { createApi, fakeBaseQuery, skipToken } from 'ngrx-rtk-query/core';

import { type Post } from './helpers/create-posts-api';
import { renderWithNoopStoreApi } from './helpers/render-with-noop-store-api';
import { createTemplateEvaluationMarks } from './helpers/template-evaluation-marks';

type OffsetLimitPageParam = {
  offset: number;
  limit: number;
};

const createOffsetLimitInfinitePostsApi = (reducerPath: string) => {
  let fetchCount = 0;

  const postsApi = createApi({
    reducerPath,
    baseQuery: fakeBaseQuery(),
    endpoints: (build) => ({
      getPostPages: build.infiniteQuery<Post[], void, OffsetLimitPageParam>({
        queryFn: async ({ pageParam }) => {
          fetchCount += 1;
          return {
            data: Array.from({ length: pageParam.limit }, (_, index) => ({
              id: pageParam.offset + index,
              name: `post-${pageParam.offset + index}`,
            })),
          };
        },
        infiniteQueryOptions: {
          initialPageParam: { offset: 0, limit: 2 },
          getNextPageParam: () => undefined,
        },
      }),
    }),
  });

  return { postsApi, getFetchCount: () => fetchCount };
};

describe('infinite query hooks', () => {
  test('loads pages forward and backward through the infinite query hook', async () => {
    const postsApi = createApi({
      reducerPath: 'infiniteQueryNavigationApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPostPages: build.infiniteQuery<Post[], string, number>({
          queryFn: async ({ queryArg, pageParam }) => ({
            data: [{ id: pageParam, name: `${queryArg}-post-${pageParam}` }],
          }),
          infiniteQueryOptions: {
            initialPageParam: 1,
            getNextPageParam: (_lastPage, _allPages, lastPageParam) => lastPageParam + 1,
            getPreviousPageParam: (_firstPage, _allPages, firstPageParam) =>
              firstPageParam > 0 ? firstPageParam - 1 : undefined,
          },
        }),
      }),
    });
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postPagesQuery.fetchPreviousPage()">previous page</button>
        <button (click)="postPagesQuery.fetchNextPage()">next page</button>
        @for (page of postPagesQuery.data()?.pages ?? []; track $index) {
          <p data-testid="page-name">{{ page[0]?.name }}</p>
        }
      `,
    })
    class HostComponent {
      readonly postPagesQuery = postsApi.useGetPostPagesInfiniteQuery('feed');
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(await screen.findByText('feed-post-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'next page' }));

    expect(await screen.findByText('feed-post-2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'previous page' }));

    expect(await screen.findByText('feed-post-0')).toBeInTheDocument();
    expect(screen.getAllByTestId('page-name').map((element) => element.textContent)).toEqual([
      'feed-post-0',
      'feed-post-1',
      'feed-post-2',
    ]);
  });

  test.each([
    ['skip option', false],
    ['skipToken', true],
  ])('does not fetch until enabled through %s', async (_label, useSkipToken) => {
    let fetchCount = 0;
    const postsApi = createApi({
      reducerPath: useSkipToken ? 'infiniteQuerySkipTokenApi' : 'infiniteQuerySkipOptionApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPostPages: build.infiniteQuery<Post[], string, number>({
          queryFn: async ({ queryArg, pageParam }) => {
            fetchCount += 1;
            return {
              data: [{ id: pageParam, name: `${queryArg}-post-${pageParam}` }],
            };
          },
          infiniteQueryOptions: {
            initialPageParam: 0,
            getNextPageParam: () => undefined,
          },
        }),
      }),
    });
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="enabled.set(true)">enable</button>
        <p>{{ postPagesQuery.isUninitialized() ? 'skipped' : 'active' }}</p>
        <p>{{ postPagesQuery.data()?.pages?.[0]?.[0]?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly enabled = signal(false);
      readonly postPagesQuery = postsApi.useGetPostPagesInfiniteQuery(
        () => (this.enabled() || !useSkipToken ? 'feed' : skipToken),
        () => ({ skip: useSkipToken ? false : !this.enabled() }),
      );
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByText('skipped')).toBeInTheDocument();
    expect(fetchCount).toBe(0);

    await user.click(screen.getByRole('button', { name: 'enable' }));

    expect(await screen.findByText('feed-post-0')).toBeInTheDocument();
    expect(fetchCount).toBe(1);
  });

  test('object page params do not refetch when unrelated component state changes', async () => {
    const { postsApi, getFetchCount } = createOffsetLimitInfinitePostsApi('infiniteQueryStablePageParamApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="counter.update((value) => value + 1)">increment</button>
        <p>counter {{ counter() }}</p>
        @for (post of postPagesQuery.data()?.pages?.[0] ?? []; track post.id) {
          <p data-testid="post-name">{{ post.name }}</p>
        }
      `,
    })
    class HostComponent {
      readonly counter = signal(0);
      readonly postPagesQuery = postsApi.useGetPostPagesInfiniteQuery(undefined, {
        initialPageParam: { offset: 10, limit: 2 },
      });
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await waitFor(() => {
      expect(screen.getAllByTestId('post-name').map((element) => element.textContent)).toEqual(['post-10', 'post-11']);
      expect(getFetchCount()).toBe(1);
    });

    await user.click(screen.getByRole('button', { name: 'increment' }));

    expect(screen.getByText('counter 1')).toBeInTheDocument();
    expect(getFetchCount()).toBe(1);
  });

  test.each([
    ['hook option', true],
    ['refetch option', false],
  ])('%s refetchCachedPages false refetches only the first cached page', async (_label, useHookOption) => {
    const fetchLog: number[] = [];
    const postsApi = createApi({
      reducerPath: useHookOption ? 'infiniteQueryHookRefetchCachedPagesApi' : 'infiniteQueryCallRefetchCachedPagesApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPostPages: build.infiniteQuery<Post[], string, number>({
          queryFn: async ({ queryArg, pageParam }) => {
            fetchLog.push(pageParam);
            return {
              data: [{ id: pageParam, name: `${queryArg}-post-${pageParam}` }],
            };
          },
          infiniteQueryOptions: {
            initialPageParam: 0,
            getNextPageParam: (_lastPage, _allPages, lastPageParam) => lastPageParam + 1,
          },
        }),
      }),
    });
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postPagesQuery.fetchNextPage()">next page</button>
        <button (click)="refetchFirstPage()">refetch first page</button>
        @for (page of postPagesQuery.data()?.pages ?? []; track $index) {
          <p data-testid="page-name">{{ page[0]?.name }}</p>
        }
      `,
    })
    class HostComponent {
      readonly postPagesQuery = postsApi.useGetPostPagesInfiniteQuery(
        'feed',
        useHookOption ? { refetchCachedPages: false } : {},
      );

      refetchFirstPage() {
        if (useHookOption) {
          this.postPagesQuery.refetch();
          return;
        }

        this.postPagesQuery.refetch({ refetchCachedPages: false });
      }
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(await screen.findByText('feed-post-0')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'next page' }));
    expect(await screen.findByText('feed-post-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'next page' }));
    expect(await screen.findByText('feed-post-2')).toBeInTheDocument();
    expect(fetchLog).toEqual([0, 1, 2]);

    await user.click(screen.getByRole('button', { name: 'refetch first page' }));

    await waitFor(() => {
      expect(screen.getAllByTestId('page-name').map((element) => element.textContent)).toEqual(['feed-post-0']);
      expect(fetchLog).toEqual([0, 1, 2, 0]);
    });
  });

  test('object page params keep initial template renders and fetches bounded', async () => {
    const templateMarks = createTemplateEvaluationMarks();
    const { postsApi, getFetchCount } = createOffsetLimitInfinitePostsApi('infiniteQueryStablePageParamRenderCountApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <span hidden>{{ markEvaluation() }}</span>
        @for (post of postPagesQuery.data()?.pages?.[0] ?? []; track post.id) {
          <p data-testid="post-name">{{ post.name }}</p>
        }
      `,
    })
    class HostComponent {
      readonly postPagesQuery = postsApi.useGetPostPagesInfiniteQuery(undefined, {
        initialPageParam: { offset: 10, limit: 2 },
      });

      markEvaluation = templateMarks.mark;
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await waitFor(() => {
      expect(screen.getAllByTestId('post-name').map((element) => element.textContent)).toEqual(['post-10', 'post-11']);
    });

    expect(getFetchCount()).toBe(1);
    expect(templateMarks.count()).toBeLessThanOrEqual(3);
  });
});
