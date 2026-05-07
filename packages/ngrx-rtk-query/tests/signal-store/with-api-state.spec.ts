import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  computed,
  createEnvironmentInjector,
  inject,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signalStore, withComputed, withProps } from '@ngrx/signals';
import { provideStore } from '@ngrx/store';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { createApi, fakeBaseQuery } from 'ngrx-rtk-query/core';
import { provideNoopStoreApi } from 'ngrx-rtk-query/noop-store';
import { withApi, withApiState } from 'ngrx-rtk-query/signal-store';
import { provideStoreApi } from 'ngrx-rtk-query/store';

import { type Post, createFailingPostsApi, createPostsApi } from '../helpers/create-posts-api';

describe('withApiState', () => {
  test('supports deriving query state inside the same store', async () => {
    const postsApi = createPostsApi('derivedSignalStoreApi');
    const SignalStoreRuntime = signalStore(
      withApi(postsApi),
      withApiState(postsApi),
      withComputed((store) => {
        const selectedPostsState = store.getPostsState();

        return {
          selectedPostName: computed(() => selectedPostsState().data?.[0]?.name ?? 'empty'),
        };
      }),
    );

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="query-name">{{ postsQuery.data()?.[0]?.name }}</p>
        <p data-testid="selected-post-name">{{ runtime.selectedPostName() }}</p>
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
      expect(screen.getByTestId('query-name')).toHaveTextContent('derivedSignalStoreApi-post');
      expect(screen.getByTestId('selected-post-name')).toHaveTextContent('derivedSignalStoreApi-post');
    });
  });

  test('supports argful query state methods', async () => {
    const postsApi = createApi({
      reducerPath: 'argfulSignalStoreApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPostDetails: build.query<Post, number>({
          queryFn: async (id) => ({
            data: { id, name: `post-${id}` },
          }),
        }),
      }),
    });
    const SignalStoreRuntime = signalStore(
      withApi(postsApi),
      withApiState(postsApi),
      withComputed((store) => {
        const selectedPostState = store.getPostDetailsState(7);

        return {
          selectedPostName: computed(() => selectedPostState().data?.name ?? 'empty'),
        };
      }),
    );

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="query-name">{{ postQuery.data()?.name }}</p>
        <p data-testid="selected-post-name">{{ runtime.selectedPostName() }}</p>
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
      readonly postQuery = postsApi.useGetPostDetailsQuery(7);
    }

    await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('post-7');
      expect(screen.getByTestId('selected-post-name')).toHaveTextContent('post-7');
    });
  });

  test('supports infinite query state methods', async () => {
    const postsApi = createApi({
      reducerPath: 'infiniteSignalStoreApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPostPages: build.infiniteQuery<Post[], string, number>({
          queryFn: async ({ queryArg, pageParam }) => ({
            data: [{ id: pageParam, name: `${queryArg}-${pageParam}` }],
          }),
          infiniteQueryOptions: {
            initialPageParam: 0,
            getNextPageParam: () => undefined,
          },
        }),
      }),
    });
    const SignalStoreRuntime = signalStore(
      withApi(postsApi),
      withApiState(postsApi),
      withComputed((store) => {
        const selectedPostPagesState = store.getPostPagesState('feed');

        return {
          selectedFirstPostName: computed(() => selectedPostPagesState().data?.pages[0]?.[0]?.name ?? 'empty'),
        };
      }),
    );

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="query-name">{{ postPagesQuery.data()?.pages?.[0]?.[0]?.name }}</p>
        <p data-testid="selected-post-name">{{ runtime.selectedFirstPostName() }}</p>
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
      readonly postPagesQuery = postsApi.useGetPostPagesInfiniteQuery('feed');
    }

    await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('feed-0');
      expect(screen.getByTestId('selected-post-name')).toHaveTextContent('feed-0');
    });
  });

  test('supports selecting state inside store props before any query hook mounts', async () => {
    const postsApi = createPostsApi('propsSignalStoreApi');
    const SignalStoreRuntime = signalStore(
      withApi(postsApi),
      withApiState(postsApi),
      withProps((store) => ({
        selectedPostsState: store.getPostsState(),
      })),
      withComputed(({ selectedPostsState }) => ({
        selectedPostStatus: computed(() => selectedPostsState().status),
      })),
    );

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="selected-post-status">{{ runtime.selectedPostStatus() }}</p>
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
    }

    await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    expect(screen.getByTestId('selected-post-status')).toHaveTextContent('uninitialized');
  });

  test('supports deriving values from query state captured in store props', async () => {
    const postsApi = createPostsApi('propsDerivedSignalStoreApi');
    const SignalStoreRuntime = signalStore(
      withApi(postsApi),
      withApiState(postsApi),
      withProps((store) => ({
        selectedPostsState: store.getPostsState(),
      })),
      withComputed(({ selectedPostsState }) => ({
        selectedPostsCount: computed(() => selectedPostsState().data?.length ?? 0),
      })),
    );

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="query-name">{{ postsQuery.data()?.[0]?.name }}</p>
        <p data-testid="selected-posts-count">{{ runtime.selectedPostsCount() }}</p>
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
      expect(screen.getByTestId('query-name')).toHaveTextContent('propsDerivedSignalStoreApi-post');
      expect(screen.getByTestId('selected-posts-count')).toHaveTextContent('1');
    });
  });

  test('can capture generated state signals before a host is mounted and read them after the host appears', () => {
    const postsApi = createPostsApi('deferredReaderApi');
    const ParentRuntime = signalStore(withApi(postsApi));
    const ReaderStore = signalStore(
      withApiState(postsApi),
      withProps((store) => ({
        selectedPostsState: store.getPostsState(),
      })),
    );
    const parent = TestBed.inject(EnvironmentInjector);
    const readerEnvironment = createEnvironmentInjector([ReaderStore], parent);

    try {
      const readerStore = readerEnvironment.get(ReaderStore);

      const hostEnvironment = createEnvironmentInjector([ParentRuntime], parent);

      try {
        hostEnvironment.get(ParentRuntime);
        expect(readerStore.selectedPostsState().status).toBe('uninitialized');
      } finally {
        hostEnvironment.destroy();
      }
    } finally {
      readerEnvironment.destroy();
    }
  });

  test('supports mutation state methods through fixedCacheKey', async () => {
    const postsApi = createPostsApi('mutationStateApi');
    const SignalStoreRuntime = signalStore(withApi(postsApi), withApiState(postsApi));
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="addPost({ name: 'Saved' })">save</button>
        <p data-testid="selected-mutation">{{ selectedMutation().data?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
      readonly addPost = postsApi.useAddPostMutation({ fixedCacheKey: 'save-post' });
      readonly selectedMutation = this.runtime.addPostState({ fixedCacheKey: 'save-post' });
    }

    await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    expect(screen.getByTestId('selected-mutation')).toHaveTextContent('empty');
    await user.click(screen.getByRole('button', { name: 'save' }));
    await waitFor(() => {
      expect(screen.getByTestId('selected-mutation')).toHaveTextContent('Saved');
    });
  });

  test('requires a valid fixedCacheKey for mutation state methods', async () => {
    const postsApi = createPostsApi('invalidMutationStateApi');
    const SignalStoreRuntime = signalStore(withApi(postsApi), withApiState(postsApi));

    @Component({
      standalone: true,
      template: `
        invalid-mutation-state
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
      readonly selectedMutation = this.runtime.addPostState({ fixedCacheKey: '' });
    }

    await expect(
      render(HostComponent, {
        providers: [SignalStoreRuntime],
      }),
    ).rejects.toThrow(/requires a valid fixedCacheKey for "addPostState\(\)"/);
  });

  test('supports using withApiState in a child store when the parent store mounts the api', async () => {
    const postsApi = createPostsApi('childStoreSignalStoreApi');
    const ParentRuntime = signalStore(withApi(postsApi));
    const ChildStore = signalStore(
      withApiState(postsApi),
      withComputed((store) => {
        const selectedPostsState = store.getPostsState();

        return {
          selectedPostName: computed(() => selectedPostsState().data?.[0]?.name ?? 'empty'),
        };
      }),
    );

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="query-name">{{ postsQuery.data()?.[0]?.name }}</p>
        <p data-testid="selected-post-name">{{ childStore.selectedPostName() }}</p>
      `,
    })
    class HostComponent {
      readonly parentRuntime = inject(ParentRuntime);
      readonly childStore = inject(ChildStore);
      readonly postsQuery = postsApi.useGetPostsQuery();
    }

    await render(HostComponent, {
      providers: [ParentRuntime, ChildStore],
    });

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('childStoreSignalStoreApi-post');
      expect(screen.getByTestId('selected-post-name')).toHaveTextContent('childStoreSignalStoreApi-post');
    });
  });

  test('supports withApiState when the api is mounted by provideStoreApi', async () => {
    const postsApi = createPostsApi('storeRuntimeApi');
    const ReaderStore = signalStore(
      withApiState(postsApi),
      withComputed((store) => {
        const selectedPostsState = store.getPostsState();

        return {
          selectedPostName: computed(() => selectedPostsState().data?.[0]?.name ?? 'empty'),
        };
      }),
    );

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="query-name">{{ postsQuery.data()?.[0]?.name }}</p>
        <p data-testid="selected-post-name">{{ readerStore.selectedPostName() }}</p>
      `,
    })
    class HostComponent {
      readonly readerStore = inject(ReaderStore);
      readonly postsQuery = postsApi.useGetPostsQuery();
    }

    await render(HostComponent, {
      providers: [provideStore(), provideStoreApi(postsApi), ReaderStore],
    });

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('storeRuntimeApi-post');
      expect(screen.getByTestId('selected-post-name')).toHaveTextContent('storeRuntimeApi-post');
    });
  });

  test('supports withApiState when the api is mounted by provideNoopStoreApi', async () => {
    const postsApi = createPostsApi('noopRuntimeApi');
    const ReaderStore = signalStore(
      withApiState(postsApi),
      withComputed((store) => {
        const selectedPostsState = store.getPostsState();

        return {
          selectedPostName: computed(() => selectedPostsState().data?.[0]?.name ?? 'empty'),
        };
      }),
    );

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="query-name">{{ postsQuery.data()?.[0]?.name }}</p>
        <p data-testid="selected-post-name">{{ readerStore.selectedPostName() }}</p>
      `,
    })
    class HostComponent {
      readonly readerStore = inject(ReaderStore);
      readonly postsQuery = postsApi.useGetPostsQuery();
    }

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi), ReaderStore],
    });

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('noopRuntimeApi-post');
      expect(screen.getByTestId('selected-post-name')).toHaveTextContent('noopRuntimeApi-post');
    });
  });

  test('fails with the normal unbound api error when read without any mounted host', async () => {
    const postsApi = createPostsApi('unboundReaderApi');
    const ReaderStore = signalStore(
      withApiState(postsApi),
      withComputed((store) => {
        const selectedPostsState = store.getPostsState();

        return {
          selectedPostStatus: computed(() => selectedPostsState().status),
        };
      }),
    );

    @Component({
      standalone: true,
      template: `
        <p data-testid="selected-post-status">{{ readerStore.selectedPostStatus() }}</p>
      `,
    })
    class HostComponent {
      readonly readerStore = inject(ReaderStore);
    }

    await expect(
      render(HostComponent, {
        providers: [ReaderStore],
      }),
    ).rejects.toThrow(/Provide the API \(unboundReaderApi\) is necessary to use the queries/);
  });

  test('exposes query error state through generated state methods', async () => {
    const postsApi = createFailingPostsApi('readerErrorApi');
    const SignalStoreRuntime = signalStore(
      withApi(postsApi),
      withApiState(postsApi),
      withComputed((store) => {
        const selectedPostsState = store.getPostsState();

        return {
          selectedPostsStatus: computed(() => (selectedPostsState().isError ? 'error' : 'not error')),
        };
      }),
    );

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="query-state">{{ postsQuery.isError() ? 'error' : 'not error' }}</p>
        <p data-testid="selected-state">{{ runtime.selectedPostsStatus() }}</p>
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
      expect(screen.getByTestId('query-state')).toHaveTextContent('error');
      expect(screen.getByTestId('selected-state')).toHaveTextContent('error');
    });
  });

  test('observes query state updates after refetch', async () => {
    let fetchCount = 0;
    const postsApi = createApi({
      reducerPath: 'readerRefetchApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPosts: build.query<Post[], void>({
          queryFn: async () => {
            fetchCount += 1;
            return {
              data: [{ id: fetchCount, name: `readerRefetchApi-post-${fetchCount}` }],
            };
          },
        }),
      }),
    });
    const SignalStoreRuntime = signalStore(
      withApi(postsApi),
      withApiState(postsApi),
      withComputed((store) => {
        const selectedPostsState = store.getPostsState();

        return {
          selectedPostName: computed(() => selectedPostsState().data?.[0]?.name ?? 'empty'),
        };
      }),
    );
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postsQuery.refetch()">refetch</button>
        <p data-testid="query-name">{{ postsQuery.data()?.[0]?.name ?? 'empty' }}</p>
        <p data-testid="selected-post-name">{{ runtime.selectedPostName() }}</p>
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
      expect(screen.getByTestId('query-name')).toHaveTextContent('readerRefetchApi-post-1');
      expect(screen.getByTestId('selected-post-name')).toHaveTextContent('readerRefetchApi-post-1');
    });

    await user.click(screen.getByRole('button', { name: 'refetch' }));

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('readerRefetchApi-post-2');
      expect(screen.getByTestId('selected-post-name')).toHaveTextContent('readerRefetchApi-post-2');
    });
  });

  test('observes query state cleanup after api reset', async () => {
    const postsApi = createPostsApi('readerResetApi');
    const SignalStoreRuntime = signalStore(
      withApi(postsApi),
      withApiState(postsApi),
      withComputed((store) => {
        const selectedPostsState = store.getPostsState();

        return {
          selectedPostsStatus: computed(() => selectedPostsState().status),
          selectedPostName: computed(() => selectedPostsState().data?.[0]?.name ?? 'empty'),
        };
      }),
    );
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="resetApi()">reset api</button>
        <p data-testid="query-name">{{ postsQuery.data()?.[0]?.name ?? 'empty' }}</p>
        <p data-testid="selected-status">{{ runtime.selectedPostsStatus() }}</p>
        <p data-testid="selected-post-name">{{ runtime.selectedPostName() }}</p>
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
      readonly postsQuery = postsApi.useGetPostsQuery();

      resetApi() {
        postsApi.dispatch(postsApi.util.resetApiState());
      }
    }

    await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('readerResetApi-post');
      expect(screen.getByTestId('selected-status')).toHaveTextContent('fulfilled');
      expect(screen.getByTestId('selected-post-name')).toHaveTextContent('readerResetApi-post');
    });

    await user.click(screen.getByRole('button', { name: 'reset api' }));

    await waitFor(() => {
      expect(screen.getByTestId('selected-status')).toHaveTextContent('uninitialized');
      expect(screen.getByTestId('selected-post-name')).toHaveTextContent('empty');
    });
  });

  test('fails fast when the same api instance is added twice with withApiState', async () => {
    const baseApi = createApi({
      reducerPath: 'duplicateApiStateApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getBase: build.query<Post, void>({
          queryFn: async () => ({
            data: { id: 0, name: 'base-post' },
          }),
        }),
      }),
    });
    const extendedApi = baseApi.injectEndpoints({
      endpoints: (build) => ({
        getPosts: build.query<Post[], void>({
          queryFn: async () => ({
            data: [{ id: 1, name: 'post-1' }],
          }),
        }),
      }),
    });
    const ReaderStore = signalStore(withApiState(baseApi), withApiState(extendedApi));

    @Component({
      standalone: true,
      template: `
        duplicate-api-state
      `,
    })
    class HostComponent {
      readonly readerStore = inject(ReaderStore);
    }

    await expect(
      render(HostComponent, {
        providers: [ReaderStore],
      }),
    ).rejects.toThrow(/Add withApiState\(api\) only once per api instance in a store/);
  });

  test('fails fast when two different apis generate the same state method name', async () => {
    const firstApi = createPostsApi('firstCollisionApi');
    const secondApi = createPostsApi('secondCollisionApi');
    const ReaderStore = signalStore(withApiState(firstApi), withApiState(secondApi));

    @Component({
      standalone: true,
      template: `
        state-collision
      `,
    })
    class HostComponent {
      readonly readerStore = inject(ReaderStore);
    }

    await expect(
      render(HostComponent, {
        providers: [ReaderStore],
      }),
    ).rejects.toThrow(
      /cannot generate "getPostsState" for reducerPath "secondCollisionApi" because reducerPath "firstCollisionApi" already exposes that method/,
    );
  });

  test('fails fast when a generated state method collides with an existing store member', async () => {
    const postsApi = createPostsApi('existingMemberCollisionApi');
    const ReaderStore = signalStore(
      withProps(() => ({
        getPostsState: 'existing-member',
      })),
      withApiState(postsApi),
    );

    @Component({
      standalone: true,
      template: `
        existing-member-collision
      `,
    })
    class HostComponent {
      readonly readerStore = inject(ReaderStore);
    }

    await expect(
      render(HostComponent, {
        providers: [ReaderStore],
      }),
    ).rejects.toThrow(
      /cannot generate "getPostsState" for reducerPath "existingMemberCollisionApi" because that store member already exists/,
    );
  });

  test('keeps generated state methods as a static snapshot of the api endpoints', async () => {
    const baseApi = createApi({
      reducerPath: 'snapshotApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getBase: build.query<Post, void>({
          queryFn: async () => ({
            data: { id: 0, name: 'base-post' },
          }),
        }),
      }),
    });
    const EarlyStore = signalStore(withApiState(baseApi));
    TestBed.configureTestingModule({
      providers: [EarlyStore],
    });

    const earlyStore = TestBed.inject(EarlyStore) as Record<string, unknown>;

    expect('getPostsState' in earlyStore).toBe(false);

    TestBed.resetTestingModule();

    const extendedApi = baseApi.injectEndpoints({
      endpoints: (build) => ({
        getPosts: build.query<Post[], void>({
          queryFn: async () => ({
            data: [{ id: 1, name: 'late-post' }],
          }),
        }),
      }),
    });
    const LateStore = signalStore(withApiState(extendedApi));

    TestBed.configureTestingModule({
      providers: [LateStore],
    });

    const lateStore = TestBed.inject(LateStore) as Record<string, unknown>;

    expect('getPostsState' in lateStore).toBe(true);
  });
});
