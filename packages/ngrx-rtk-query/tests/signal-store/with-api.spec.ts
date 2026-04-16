import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  createEnvironmentInjector,
  inject,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import { render, screen, waitFor } from '@testing-library/angular';
import { describe, expect, test, vi } from 'vitest';

import { createApi, fakeBaseQuery } from 'ngrx-rtk-query/core';
import { withApi } from 'ngrx-rtk-query/signal-store';

import { type Post, createPostsApi } from '../helpers/create-posts-api';

describe('withApi', () => {
  test('mounts an api and keeps hooks working', async () => {
    const postsApi = createPostsApi('signalStoreApi');
    const SignalStoreRuntime = signalStore(withApi(postsApi));

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="query-name">{{ postsQuery.data()?.[0]?.name }}</p>
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
      readonly postsQuery = postsApi.useGetPostsQuery();
    }

    await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('signalStoreApi-post');
    });
  });

  test('refetches every mounted api on focus in a multi-api signal store', async () => {
    let postsFetchCount = 0;
    let usersFetchCount = 0;
    const postsQueryFn = vi.fn(async () => ({
      data: [{ id: 1, name: `posts-${++postsFetchCount}` }],
    }));
    const usersQueryFn = vi.fn(async () => ({
      data: [{ id: 1, name: `users-${++usersFetchCount}` }],
    }));
    const postsApi = createApi({
      reducerPath: 'focusPostsApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPosts: build.query<Post[], void>({
          queryFn: postsQueryFn,
        }),
      }),
    });
    const usersApi = createApi({
      reducerPath: 'focusUsersApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getUsers: build.query<Array<{ id: number; name: string }>, void>({
          queryFn: usersQueryFn,
        }),
      }),
    });
    const SignalStoreRuntime = signalStore(withApi(postsApi), withApi(usersApi));

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="posts">{{ postsQuery.data()?.[0]?.name }}</p>
        <p data-testid="users">{{ usersQuery.data()?.[0]?.name }}</p>
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
      readonly postsQuery = postsApi.useGetPostsQuery(undefined, { refetchOnFocus: true });
      readonly usersQuery = usersApi.useGetUsersQuery(undefined, { refetchOnFocus: true });
    }

    await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    await waitFor(() => {
      expect(screen.getByTestId('posts')).toHaveTextContent('posts-1');
      expect(screen.getByTestId('users')).toHaveTextContent('users-1');
    });

    window.dispatchEvent(new Event('focus'));

    await waitFor(() => {
      expect(screen.getByTestId('posts')).toHaveTextContent('posts-2');
      expect(screen.getByTestId('users')).toHaveTextContent('users-2');
    });
    expect(postsQueryFn).toHaveBeenCalledTimes(2);
    expect(usersQueryFn).toHaveBeenCalledTimes(2);
  });

  test('fails fast when the same api instance is added twice in one signal store', async () => {
    const sharedApi = createPostsApi('duplicateApiInstance');
    const SignalStoreRuntime = signalStore(withApi(sharedApi), withApi(sharedApi));

    @Component({
      standalone: true,
      template: `
        duplicate-api-instance
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
    }

    await expect(
      render(HostComponent, {
        providers: [SignalStoreRuntime],
      }),
    ).rejects.toThrow(/Add withApi\(api\) only once per api instance/);
  });

  test('fails fast when two mounted apis use the same reducerPath in one signal store', async () => {
    const firstApi = createPostsApi('duplicateReducerPathApi');
    const secondApi = createApi({
      reducerPath: 'duplicateReducerPathApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getUsers: build.query<Array<{ id: number; name: string }>, void>({
          queryFn: async () => ({
            data: [{ id: 1, name: 'Ada' }],
          }),
        }),
      }),
    });
    const SignalStoreRuntime = signalStore(withApi(firstApi), withApi(secondApi));

    @Component({
      standalone: true,
      template: `
        duplicate-reducer-path
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
    }

    await expect(
      render(HostComponent, {
        providers: [SignalStoreRuntime],
      }),
    ).rejects.toThrow(/Duplicate RTK Query reducerPath "duplicateReducerPathApi" in signalStore/);
  });

  test('fails when the same api instance is bound to a second host store', async () => {
    const sharedApi = createPostsApi('sharedBindingApi');
    const FirstRuntime = signalStore(withApi(sharedApi));
    const SecondRuntime = signalStore(withApi(sharedApi));
    const parent = TestBed.inject(EnvironmentInjector);
    const firstEnvironment = createEnvironmentInjector([FirstRuntime], parent);

    try {
      firstEnvironment.get(FirstRuntime);

      expect(() => {
        const secondEnvironment = createEnvironmentInjector([SecondRuntime], parent);

        try {
          secondEnvironment.get(SecondRuntime);
        } finally {
          secondEnvironment.destroy();
        }
      }).toThrow(/already bound to another host/);
    } finally {
      firstEnvironment.destroy();
    }
  });

  test('releases api binding when setupListeners fails after initApiStore succeeds', async () => {
    const postsApi = createPostsApi('recoverySignalStoreApi');
    const failingSetupListeners = vi.fn(() => {
      throw new Error('setupListeners failed');
    });
    const FailingRuntime = signalStore(withApi(postsApi, { setupListeners: failingSetupListeners }));
    const RecoveryRuntime = signalStore(withApi(postsApi));

    @Component({
      standalone: true,
      template: `
        failing-runtime
      `,
    })
    class FailingHostComponent {
      readonly runtime = inject(FailingRuntime);
    }

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="query-name">{{ postsQuery.data()?.[0]?.name }}</p>
      `,
    })
    class RecoveryHostComponent {
      readonly runtime = inject(RecoveryRuntime);
      readonly postsQuery = postsApi.useGetPostsQuery();
    }

    await expect(
      render(FailingHostComponent, {
        providers: [FailingRuntime],
      }),
    ).rejects.toThrow(/setupListeners failed/);

    expect(failingSetupListeners).toHaveBeenCalledTimes(1);

    TestBed.resetTestingModule();

    await render(RecoveryHostComponent, {
      providers: [RecoveryRuntime],
    });

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('recoverySignalStoreApi-post');
    });
  });
});
