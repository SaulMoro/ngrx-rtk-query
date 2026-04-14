import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { signalStore, withComputed, withMethods, withProps } from '@ngrx/signals';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { type AngularHooksModuleOptions, type Dispatch, createApi, fakeBaseQuery } from 'ngrx-rtk-query/core';
import { withApi } from 'ngrx-rtk-query/signal-store';

import { type Post, createPostsApi } from '../helpers/create-posts-api';

type InitializedTestApi = ReturnType<typeof createPostsApi> & {
  dispatch: Dispatch;
  initApiStore: (
    setupFn: () => AngularHooksModuleOptions,
    bindingMetadata: {
      bindingKey: object;
      runtimeLabel: string;
    },
  ) => () => void;
};

describe('withApi', () => {
  test('supports a single API and keeps query selection equivalent to api.selectSignal', async () => {
    const postsApi = createPostsApi('signalStoreApi');
    const SignalStoreRuntime = signalStore(withApi(postsApi));

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <h1>signal-store-runtime</h1>
        <p data-testid="query-name">{{ postsQuery.data()?.[0]?.name }}</p>
        <p data-testid="selected-name">{{ selectedPosts()?.data?.[0]?.name }}</p>
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
      readonly postsQuery = postsApi.useGetPostsQuery();
      readonly selectedPosts = this.runtime.selectApiState(postsApi.endpoints.getPosts);
    }

    await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('signalStoreApi-post');
    });
    expect(screen.getByTestId('selected-name')).toHaveTextContent('signalStoreApi-post');
  });

  test('supports deriving selected query data inside the signal store', async () => {
    const postsApi = createPostsApi('derivedSignalStoreApi');
    const SignalStoreRuntime = signalStore(
      withApi(postsApi),
      withComputed((store) => {
        const selectedPostsState = store.selectApiState(postsApi.endpoints.getPosts);

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

  test('supports generated endpoint state methods inside withComputed', async () => {
    const postsApi = createPostsApi('generatedMethodSignalStoreApi');
    const SignalStoreRuntime = signalStore(
      withApi(postsApi),
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
      expect(screen.getByTestId('query-name')).toHaveTextContent('generatedMethodSignalStoreApi-post');
      expect(screen.getByTestId('selected-post-name')).toHaveTextContent('generatedMethodSignalStoreApi-post');
    });
  });

  test('supports generated endpoint state methods for argful queries', async () => {
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

  test('supports selecting endpoint state directly inside signal store props before any query hook mounts', async () => {
    const postsApi = createPostsApi('propsSignalStoreApi');
    const SignalStoreRuntime = signalStore(
      withApi(postsApi),
      withProps((store) => ({
        selectedPostsState: store.selectApiState(postsApi.endpoints.getPosts),
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

  test('fails fast when the signal store already defines selectApiState', async () => {
    const postsApi = createPostsApi('collidingSignalStoreApi');
    const SignalStoreRuntime = signalStore(
      withMethods(() => ({
        selectApiState: () => undefined,
      })),
      withApi(postsApi),
    );

    @Component({
      standalone: true,
      template: `
        collision
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
    }

    await expect(
      render(HostComponent, {
        providers: [SignalStoreRuntime],
      }),
    ).rejects.toThrow(/Signal Store already defines a "selectApiState" method/);
  });

  test('fails fast when generated endpoint state methods collide with an existing store member', async () => {
    const postsApi = createPostsApi('collidingGeneratedStateApi');
    const SignalStoreRuntime = signalStore(
      withMethods(() => ({
        getPostsState: () => undefined,
      })),
      withApi(postsApi),
    );

    @Component({
      standalone: true,
      template: `
        collision
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
    }

    await expect(
      render(HostComponent, {
        providers: [SignalStoreRuntime],
      }),
    ).rejects.toThrow(/cannot generate "getPostsState" because that store member already exists/);
  });

  test('accepts selectApiState(endpoint) for void queries without passing undefined', async () => {
    const postsApi = createPostsApi('optionalArgSignalStoreApi');
    const SignalStoreRuntime = signalStore(withApi(postsApi));

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="selected-status">{{ selectedPosts().status }}</p>
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
      readonly selectedPosts = this.runtime.selectApiState(postsApi.endpoints.getPosts);
    }

    await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    expect(screen.getByTestId('selected-status')).toHaveTextContent('uninitialized');
  });

  test('supports multiple APIs with distinct reducerPaths in the same signal store', async () => {
    const postsApi = createPostsApi('postsApi');
    const usersApi = createApi({
      reducerPath: 'usersApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getUsers: build.query<Array<{ id: number; name: string }>, void>({
          queryFn: async () => ({
            data: [{ id: 1, name: 'Alice' }],
          }),
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
      readonly postsQuery = postsApi.useGetPostsQuery();
      readonly usersQuery = usersApi.useGetUsersQuery();
    }

    await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    await waitFor(() => {
      expect(screen.getByTestId('posts')).toHaveTextContent('postsApi-post');
      expect(screen.getByTestId('users')).toHaveTextContent('Alice');
    });
  });

  test('fails fast when multiple apis in the same host generate the same endpoint state method name', async () => {
    const firstApi = createApi({
      reducerPath: 'firstCollisionApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPosts: build.query<Post[], void>({
          queryFn: async () => ({
            data: [{ id: 1, name: 'first-post' }],
          }),
        }),
      }),
    });
    const secondApi = createApi({
      reducerPath: 'secondCollisionApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPosts: build.query<Post[], void>({
          queryFn: async () => ({
            data: [{ id: 2, name: 'second-post' }],
          }),
        }),
      }),
    });
    const SignalStoreRuntime = signalStore(withApi(firstApi), withApi(secondApi));

    @Component({
      standalone: true,
      template: `
        collision
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
    }

    await expect(
      render(HostComponent, {
        providers: [SignalStoreRuntime],
      }),
    ).rejects.toThrow(/cannot generate "getPostsState" because that store member already exists/);
  });

  test('does not invalidate apiA selector state when apiB updates', async () => {
    const postsApi = createPostsApi('postsApi');
    const usersApi = createApi({
      reducerPath: 'usersApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getUsers: build.query<Array<{ id: number; name: string }>, void>({
          queryFn: async () => ({
            data: [{ id: 1, name: 'Alice' }],
          }),
        }),
        addUser: build.mutation<{ id: number; name: string }, { name: string }>({
          queryFn: async ({ name }) => ({
            data: { id: 2, name },
          }),
        }),
      }),
    });
    const SignalStoreRuntime = signalStore(withApi(postsApi), withApi(usersApi));
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="addUser({ name: 'Bob' })">add-user</button>
        <p data-testid="posts">{{ postsQuery.data()?.[0]?.name }}</p>
        <p data-testid="mutation">{{ addUser.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
      readonly postsQuery = postsApi.useGetPostsQuery();
      readonly usersQuery = usersApi.useGetUsersQuery();
      readonly selectedPosts = this.runtime.selectApiState(postsApi.endpoints.getPosts);
      readonly addUser = usersApi.useAddUserMutation({ fixedCacheKey: 'add-user' });
      readonly selectedPostsRuns = signal(0);

      readonly #trackSelectedPosts = effect(() => {
        this.selectedPosts().data?.[0]?.name;
        this.selectedPostsRuns.update((value) => value + 1);
      });
    }

    const { fixture } = await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    await waitFor(() => {
      expect(screen.getByTestId('posts')).toHaveTextContent('postsApi-post');
    });

    const initialSelectedPostsRuns = fixture.componentInstance.selectedPostsRuns();
    await user.click(screen.getByRole('button', { name: 'add-user' }));

    await waitFor(() => {
      expect(screen.getByTestId('mutation')).toHaveTextContent('Bob');
    });
    expect(fixture.componentInstance.selectedPostsRuns()).toBe(initialSelectedPostsRuns);
  });

  test('fails fast on duplicate reducerPath registration', async () => {
    const firstApi = createPostsApi('duplicateApi');
    const secondApi = createPostsApi('duplicateApi');
    const SignalStoreRuntime = signalStore(withApi(firstApi), withApi(secondApi));
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    @Component({
      standalone: true,
      template: `
        duplicate
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
    }

    try {
      await expect(
        render(HostComponent, {
          providers: [SignalStoreRuntime],
        }),
      ).rejects.toThrow(/Duplicate RTK Query reducerPath "duplicateApi" in signalStore/);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    } finally {
      consoleWarnSpy.mockRestore();
    }
  });

  test('fails when the same api instance is bound to a second host store', async () => {
    const sharedApi = createPostsApi('sharedApi');
    const FirstRuntime = signalStore(withApi(sharedApi));
    const SecondRuntime = signalStore(withApi(sharedApi));

    @Component({
      standalone: true,
      template: `
        collision
      `,
    })
    class HostComponent {
      readonly firstRuntime = inject(FirstRuntime);
      readonly secondRuntime = inject(SecondRuntime);
    }

    await expect(
      render(HostComponent, {
        providers: [FirstRuntime, SecondRuntime],
      }),
    ).rejects.toThrow(/already bound to another host/);
  });

  test('cleans up early endpoint registration when host initialization fails', async () => {
    const sharedApi = createPostsApi('sharedApiCleanup');
    const FirstRuntime = signalStore(withApi(sharedApi));
    const SecondRuntime = signalStore(
      withApi(sharedApi),
      withProps((store) => ({
        selectedPostsState: store.selectApiState(sharedApi.endpoints.getPosts),
      })),
      withComputed(({ selectedPostsState }) => ({
        selectedPostStatus: computed(() => selectedPostsState().status),
      })),
    );

    @Component({
      standalone: true,
      template: `
        collision-cleanup
      `,
    })
    class FailingHostComponent {
      readonly firstRuntime = inject(FirstRuntime);
      readonly secondRuntime = inject(SecondRuntime);
    }

    @Component({
      standalone: true,
      template: `
        <p data-testid="selected-post-status">{{ runtime.selectedPostStatus() }}</p>
      `,
    })
    class RecoveryHostComponent {
      readonly runtime = inject(SecondRuntime);
    }

    await expect(
      render(FailingHostComponent, {
        providers: [FirstRuntime, SecondRuntime],
      }),
    ).rejects.toThrow(/already bound to another host/);

    TestBed.resetTestingModule();

    await render(RecoveryHostComponent, {
      providers: [SecondRuntime],
    });

    expect(screen.getByTestId('selected-post-status')).toHaveTextContent('uninitialized');
  });

  test('releases api binding when setupListeners fails after initApiStore succeeds', async () => {
    const postsApi = createPostsApi('setupListenersFailureApi');
    const failingSetupListeners = vi.fn(() => {
      throw new Error('setupListeners failed');
    });
    const FailingRuntime = signalStore(withApi(postsApi, { setupListeners: failingSetupListeners }));
    const RecoveryRuntime = signalStore(
      withApi(postsApi),
      withProps((store) => ({
        selectedPostsState: store.selectApiState(postsApi.endpoints.getPosts),
      })),
      withComputed(({ selectedPostsState }) => ({
        selectedPostStatus: computed(() => selectedPostsState().status),
      })),
    );

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
      template: `
        <p data-testid="selected-post-status">{{ runtime.selectedPostStatus() }}</p>
      `,
    })
    class RecoveryHostComponent {
      readonly runtime = inject(RecoveryRuntime);
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

    expect(screen.getByTestId('selected-post-status')).toHaveTextContent('uninitialized');
  });

  test('unbinds the api when the host store is released', () => {
    const postsApi = createPostsApi('releasedApi') as InitializedTestApi;
    const releaseApiStore = postsApi.initApiStore(
      () =>
        ({
          hooks: {
            dispatch: ((action: unknown) => action) as Dispatch,
            getState: () => ({ [postsApi.reducerPath]: {} }),
            useSelector: (mapFn) => computed(() => mapFn({ [postsApi.reducerPath]: {} })),
          },
          createSelector: () => (() => undefined) as never,
          getInjector: () => ({}) as never,
        }) satisfies AngularHooksModuleOptions,
      {
        bindingKey: {},
        runtimeLabel: 'signal-store',
      },
    );

    expect(() => postsApi.dispatch(postsApi.util.resetApiState())).not.toThrow();

    releaseApiStore();

    expect(() => postsApi.dispatch(postsApi.util.resetApiState())).toThrow(
      /Provide the API \(releasedApi\) is necessary to use the queries/,
    );
  });

  test('reports the resolved reducerPath in binding errors when the api uses the default reducerPath', async () => {
    const defaultReducerPathApi = createApi({
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPosts: build.query<Post[], void>({
          queryFn: async () => ({
            data: [{ id: 1, name: 'default-post' }],
          }),
        }),
      }),
    });
    const FirstRuntime = signalStore(withApi(defaultReducerPathApi));
    const SecondRuntime = signalStore(withApi(defaultReducerPathApi));

    @Component({
      standalone: true,
      template: `
        default-reducer-path-collision
      `,
    })
    class HostComponent {
      readonly firstRuntime = inject(FirstRuntime);
      readonly secondRuntime = inject(SecondRuntime);
    }

    await expect(
      render(HostComponent, {
        providers: [FirstRuntime, SecondRuntime],
      }),
    ).rejects.toThrow(/reducerPath "api" is already bound to another host/);
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

  test('fails when selecting an endpoint whose API is not registered in the signal store', async () => {
    const registeredApi = createPostsApi('registeredApi');
    const foreignApi = createPostsApi('foreignApi');
    const SignalStoreRuntime = signalStore(withApi(registeredApi));

    @Component({
      standalone: true,
      template: `
        foreign
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
      readonly selected = this.runtime.selectApiState(foreignApi.endpoints.getPosts);
    }

    await expect(
      render(HostComponent, {
        providers: [SignalStoreRuntime],
      }),
    ).rejects.toThrow(/Endpoint is not registered in this signal store/);
  });

  test('supports selecting query state for endpoints injected after host initialization', async () => {
    const baseApi = createApi({
      reducerPath: 'lateInjectedQueryApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getBase: build.query<Post, void>({
          queryFn: async () => ({
            data: { id: 0, name: 'base-post' },
          }),
        }),
      }),
    });
    const SignalStoreRuntime = signalStore(withApi(baseApi));

    @Component({
      standalone: true,
      template: `
        late-injected-query
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
    }

    await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    const runtime = TestBed.inject(SignalStoreRuntime);
    const postsApi = baseApi.injectEndpoints({
      endpoints: (build) => ({
        getPosts: build.query<Post[], void>({
          queryFn: async () => ({
            data: [{ id: 1, name: 'late-post' }],
          }),
        }),
      }),
    });
    const selectedPosts = runtime.selectApiState(postsApi.endpoints.getPosts);

    expect(selectedPosts().status).toBe('uninitialized');

    postsApi.dispatch(postsApi.endpoints.getPosts.initiate());

    await waitFor(() => {
      expect(selectedPosts().data?.[0]?.name).toBe('late-post');
    });
  });

  test('supports selecting mutation state for endpoints injected after host initialization', async () => {
    const baseApi = createApi({
      reducerPath: 'lateInjectedMutationApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getBase: build.query<Post, void>({
          queryFn: async () => ({
            data: { id: 0, name: 'base-post' },
          }),
        }),
      }),
    });
    const SignalStoreRuntime = signalStore(withApi(baseApi));

    @Component({
      standalone: true,
      template: `
        late-injected-mutation
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
    }

    await render(HostComponent, {
      providers: [SignalStoreRuntime],
    });

    const runtime = TestBed.inject(SignalStoreRuntime);
    const postsApi = baseApi.injectEndpoints({
      endpoints: (build) => ({
        addPost: build.mutation<Post, { name: string }>({
          queryFn: async ({ name }) => ({
            data: { id: 1, name },
          }),
        }),
      }),
    });
    const selectedMutation = runtime.selectApiState(postsApi.endpoints.addPost, {
      fixedCacheKey: 'late-save-post',
    });

    expect(selectedMutation().status).toBe('uninitialized');

    postsApi.dispatch(postsApi.endpoints.addPost.initiate({ name: 'Saved' }, { fixedCacheKey: 'late-save-post' }));

    await waitFor(() => {
      expect(selectedMutation().data?.name).toBe('Saved');
    });
  });

  test('requires fixedCacheKey when selecting mutation state', async () => {
    const postsApi = createPostsApi('mutationApi');
    const SignalStoreRuntime = signalStore(withApi(postsApi));

    @Component({
      standalone: true,
      template: `
        mutation
      `,
    })
    class HostComponent {
      readonly runtime = inject(SignalStoreRuntime);
      readonly selected = this.runtime.selectApiState(postsApi.endpoints.addPost, { fixedCacheKey: '' });
    }

    await expect(
      render(HostComponent, {
        providers: [SignalStoreRuntime],
      }),
    ).rejects.toThrow(/requires a valid fixedCacheKey for selectApiState/);
  });

  test('selects mutation state through fixedCacheKey', async () => {
    const postsApi = createPostsApi('mutationStateApi');
    const SignalStoreRuntime = signalStore(withApi(postsApi));
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
      readonly selectedMutation = this.runtime.selectApiState(postsApi.endpoints.addPost, {
        fixedCacheKey: 'save-post',
      });
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

  test('supports generated endpoint state methods for mutations', async () => {
    const postsApi = createPostsApi('generatedMutationStateApi');
    const SignalStoreRuntime = signalStore(withApi(postsApi));
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
});
