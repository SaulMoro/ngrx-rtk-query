import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { createCountingPostApi } from './helpers/create-posts-api';
import { renderWithNoopStoreApi } from './helpers/render-with-noop-store-api';

describe('prefetch hooks', () => {
  test('prefetch loads a cached query result before the query hook mounts', async () => {
    const { postsApi, getFetchCount } = createCountingPostApi('prefetchBeforeMountApi');
    const user = userEvent.setup();

    @Component({
      selector: 'lib-prefetched-post-query',
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="query-name">{{ postQuery.data()?.name ?? 'empty' }}</p>
      `,
    })
    class PrefetchedPostQueryComponent {
      readonly postQuery = postsApi.useGetPostQuery(1);
    }

    @Component({
      standalone: true,
      imports: [PrefetchedPostQueryComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="prefetchPost(1)">prefetch</button>
        <button (click)="showQuery.set(true)">show query</button>
        @if (showQuery()) {
          <lib-prefetched-post-query />
        }
      `,
    })
    class HostComponent {
      readonly showQuery = signal(false);
      readonly prefetchPost = postsApi.usePrefetch('getPost');
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'prefetch' }));

    await waitFor(() => {
      expect(getFetchCount()).toBe(1);
    });

    await user.click(screen.getByRole('button', { name: 'show query' }));

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('prefetchBeforeMountApi-post-1');
      expect(getFetchCount()).toBe(1);
    });
  });

  test('force prefetch refetches an existing cached query result', async () => {
    const { postsApi, getFetchCount } = createCountingPostApi('prefetchForceApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="prefetchPost(1)">force prefetch</button>
        <p data-testid="query-name">{{ postQuery.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly postQuery = postsApi.useGetPostQuery(1);
      readonly prefetchPost = postsApi.usePrefetch('getPost', { force: true });
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(await screen.findByText('prefetchForceApi-post-1')).toBeInTheDocument();
    expect(getFetchCount()).toBe(1);

    await user.click(screen.getByRole('button', { name: 'force prefetch' }));

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('prefetchForceApi-post-2');
      expect(getFetchCount()).toBe(2);
    });
  });
});
