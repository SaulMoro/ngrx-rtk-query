import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { createApi, fakeBaseQuery, skipToken } from 'ngrx-rtk-query/core';

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
import { createTemplateEvaluationMarks } from './helpers/template-evaluation-marks';

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

    await renderWithNoopStoreApi(HostComponent, postsApi);

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

    await renderWithNoopStoreApi(HostComponent, postsApi);

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

    await renderWithNoopStoreApi(HostComponent, postsApi);

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

    const { rerender } = await renderWithNoopStoreApi(HostComponent, postsApi, {
      componentInputs: { activeId: 1 },
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

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByText('skipped')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'enable' }));

    expect(await screen.findByText('querySkipTokenArgApi-post-1')).toBeInTheDocument();
  });

  test('skips a query through reactive options until loading is enabled', async () => {
    const postsApi = createPostsApi('queryReactiveSkipApi');
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
      readonly postQuery = postsApi.useGetPostQuery(1, () => ({ skip: this.skipped() }));
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByText('skipped')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'load' }));

    expect(await screen.findByText('queryReactiveSkipApi-post-1')).toBeInTheDocument();
  });

  test('retains data and clears currentData when a fetched query becomes skipped', async () => {
    const postsApi = createPostsApi('querySkipCachedDataApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="skipped.set(true)">skip</button>
        <p data-testid="data">{{ postQuery.data()?.name ?? 'empty' }}</p>
        <p data-testid="current-data">{{ postQuery.currentData()?.name ?? 'empty current' }}</p>
        <p>{{ postQuery.isUninitialized() ? 'uninitialized' : 'active' }}</p>
      `,
    })
    class HostComponent {
      readonly skipped = signal(false);
      readonly postQuery = postsApi.useGetPostQuery(1, () => ({ skip: this.skipped() }));
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('querySkipCachedDataApi-post-1');
      expect(screen.getByTestId('current-data')).toHaveTextContent('querySkipCachedDataApi-post-1');
    });

    await user.click(screen.getByRole('button', { name: 'skip' }));

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('querySkipCachedDataApi-post-1');
      expect(screen.getByTestId('current-data')).toHaveTextContent('empty current');
      expect(screen.getByText('uninitialized')).toBeInTheDocument();
    });
  });

  test('does not serialize skipped query args', async () => {
    const postsApi = createApi({
      reducerPath: 'querySkipSerializationApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getDeepPost: build.query<Post, { param: { nested: number } }>({
          serializeQueryArgs: ({ queryArgs }) => `post-${queryArgs.param.nested}`,
          queryFn: async ({ param }) => ({
            data: { id: param.nested, name: `querySkipSerializationApi-post-${param.nested}` },
          }),
        }),
      }),
    });
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
      readonly postQuery = postsApi.useGetDeepPostQuery(() => (this.enabled() ? { param: { nested: 1 } } : skipToken));
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByText('skipped')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'enable' }));

    expect(await screen.findByText('querySkipSerializationApi-post-1')).toBeInTheDocument();
  });

  test('accepts undefined as a query arg when the endpoint accepts it', async () => {
    const postsApi = createOptionalPostApi('queryUndefinedArgApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p>{{ postQuery.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly postQuery = postsApi.useGetOptionalPostQuery(undefined);
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(await screen.findByText('queryUndefinedArgApi-undefined-arg')).toBeInTheDocument();
  });

  test('exposes query errors without reporting success', async () => {
    const postsApi = createFailingPostApi('queryErrorApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p>{{ postQuery.isError() ? 'error' : 'not error' }}</p>
        <p>{{ postQuery.isSuccess() ? 'success' : 'not success' }}</p>
      `,
    })
    class HostComponent {
      readonly postQuery = postsApi.useGetPostQuery(1);
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(await screen.findByText('error')).toBeInTheDocument();
    expect(screen.getByText('not success')).toBeInTheDocument();
  });

  test('refetch updates data and exposes fetch progress', async () => {
    const refetchState = { count: 0 };
    const refetchedPosts = createDeferred<Post[]>('Refetch posts');
    const postsApi = createApi({
      reducerPath: 'queryRefetchApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPosts: build.query<Post[], void>({
          queryFn: async () => {
            refetchState.count += 1;
            if (refetchState.count === 1) {
              return {
                data: [{ id: 1, name: 'queryRefetchApi-post-1' }],
              };
            }

            return {
              data: await refetchedPosts.promise,
            };
          },
        }),
      }),
    });
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="postsQuery.refetch()">refetch</button>
        <p>{{ postsQuery.data()?.[0]?.name ?? 'empty' }}</p>
        <p>{{ postsQuery.isFetching() ? 'fetching' : 'idle' }}</p>
      `,
    })
    class HostComponent {
      readonly postsQuery = postsApi.useGetPostsQuery();
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(await screen.findByText('queryRefetchApi-post-1')).toBeInTheDocument();
    expect(screen.getByText('idle')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'refetch' }));

    expect(await screen.findByText('fetching')).toBeInTheDocument();

    refetchedPosts.resolve([{ id: 2, name: 'queryRefetchApi-post-2' }]);

    expect(await screen.findByText('queryRefetchApi-post-2')).toBeInTheDocument();
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  test('refetch returns a promise that resolves with the updated result', async () => {
    const { postsApi } = createCountingPostApi('queryRefetchPromiseApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="refetchPost()">refetch</button>
        <p data-testid="query-name">{{ postQuery.data()?.name ?? 'empty' }}</p>
        <p data-testid="refetch-name">{{ refetchedName() }}</p>
      `,
    })
    class HostComponent {
      readonly refetchedName = signal('empty refetch');
      readonly postQuery = postsApi.useGetPostQuery(1);

      async refetchPost() {
        const result = await this.postQuery.refetch();
        this.refetchedName.set(result.data?.name ?? 'empty refetch');
      }
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(await screen.findByText('queryRefetchPromiseApi-post-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'refetch' }));

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('queryRefetchPromiseApi-post-2');
      expect(screen.getByTestId('refetch-name')).toHaveTextContent('queryRefetchPromiseApi-post-2');
    });
  });

  test('refetchOnMountOrArgChange refetches cached data when a query component remounts', async () => {
    let fetchCount = 0;
    const postsApi = createApi({
      reducerPath: 'queryRefetchOnRemountApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPost: build.query<Post, number>({
          queryFn: async (id) => {
            fetchCount += 1;
            return {
              data: { id, name: `queryRefetchOnRemountApi-post-${fetchCount}` },
            };
          },
        }),
      }),
    });
    const user = userEvent.setup();

    @Component({
      selector: 'lib-query-refetch-on-remount-child',
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="query-name">{{ postQuery.data()?.name ?? 'empty' }}</p>
      `,
    })
    class QueryChildComponent {
      readonly postQuery = postsApi.useGetPostQuery(1, { refetchOnMountOrArgChange: true });
    }

    @Component({
      standalone: true,
      imports: [QueryChildComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="showChild.set(false)">hide</button>
        <button (click)="showChild.set(true)">show</button>
        @if (showChild()) {
          <lib-query-refetch-on-remount-child />
        }
      `,
    })
    class HostComponent {
      readonly showChild = signal(true);
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(await screen.findByText('queryRefetchOnRemountApi-post-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'hide' }));
    await user.click(screen.getByRole('button', { name: 'show' }));

    await waitFor(() => {
      expect(screen.getByTestId('query-name')).toHaveTextContent('queryRefetchOnRemountApi-post-2');
      expect(fetchCount).toBe(2);
    });
  });

  test('keeps previous data visible while a new query arg is loading', async () => {
    const nextPost = createDeferred<Post>('Next post');
    const postsApi = createApi({
      reducerPath: 'queryCurrentDataApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        getPost: build.query<Post, number>({
          queryFn: async (id) => ({
            data: id === 1 ? { id: 1, name: 'queryCurrentDataApi-post-1' } : await nextPost.promise,
          }),
        }),
      }),
    });
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="activeId.set(2)">next</button>
        <p data-testid="data">{{ postQuery.data()?.name ?? 'empty' }}</p>
        <p data-testid="current-data">{{ postQuery.currentData()?.name ?? 'empty current' }}</p>
      `,
    })
    class HostComponent {
      readonly activeId = signal(1);
      readonly postQuery = postsApi.useGetPostQuery(this.activeId);
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('queryCurrentDataApi-post-1');
      expect(screen.getByTestId('current-data')).toHaveTextContent('queryCurrentDataApi-post-1');
    });

    await user.click(screen.getByRole('button', { name: 'next' }));

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('queryCurrentDataApi-post-1');
      expect(screen.getByTestId('current-data')).toHaveTextContent('empty current');
    });

    nextPost.resolve({ id: 2, name: 'queryCurrentDataApi-post-2' });

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('queryCurrentDataApi-post-2');
      expect(screen.getByTestId('current-data')).toHaveTextContent('queryCurrentDataApi-post-2');
    });
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

    await renderWithNoopStoreApi(HostComponent, postsApi);

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

    const { fixture } = await renderWithNoopStoreApi(HostComponent, postsApi);

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

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(await screen.findByText('loading')).toBeInTheDocument();
    expect(screen.getByText('fetching')).toBeInTheDocument();

    resolvePosts([{ id: 1, name: 'querySelectedBaseFlagsApi-post' }]);

    expect(await screen.findByText('querySelectedBaseFlagsApi-post')).toBeInTheDocument();
    expect(screen.getByText('not loading')).toBeInTheDocument();
    expect(screen.getByText('not fetching')).toBeInTheDocument();
  });

  test('does not emit selected query data when unrelated refetches preserve the selected value', async () => {
    const selectedPost = { id: 1, name: 'stable selected post' };
    let posts = [selectedPost, { id: 2, name: 'other post' }];
    let fetchCount = 0;
    const selectedNames: string[] = [];
    const selectedTemplateMarks = createTemplateEvaluationMarks();
    const postsApi = createApi({
      reducerPath: 'querySelectedMemoApi',
      baseQuery: fakeBaseQuery(),
      tagTypes: ['Posts'],
      endpoints: (build) => ({
        getPosts: build.query<Post[], void>({
          queryFn: async () => {
            fetchCount += 1;
            return {
              data: posts,
            };
          },
          providesTags: (result) => result?.map(({ id }) => ({ type: 'Posts' as const, id })) ?? [],
        }),
        addPost: build.mutation<Post, { name: string }>({
          queryFn: async ({ name }) => {
            const post = { id: posts.length + 1, name };
            posts = [...posts, post];
            return { data: post };
          },
          invalidatesTags: ['Posts'],
        }),
        updatePost: build.mutation<Post, { id: number; name: string }>({
          queryFn: async ({ id, name }) => {
            const post = { id, name };
            posts = posts.map((item) => (item.id === id ? post : item));
            return { data: post };
          },
          invalidatesTags: (_result, _error, { id }) => [{ type: 'Posts', id }],
        }),
      }),
    });
    const user = userEvent.setup();

    @Component({
      selector: 'lib-query-actions',
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="addPost({ name: 'unrelated post' })">add unrelated</button>
        <button (click)="updatePost({ id: 1, name: 'updated selected post' })">update selected</button>
      `,
    })
    class QueryActionsComponent {
      readonly addPost = postsApi.useAddPostMutation();
      readonly updatePost = postsApi.useUpdatePostMutation();
    }

    @Component({
      selector: 'lib-selected-post',
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <span hidden>{{ markEvaluation() }}</span>
        <p data-testid="selected-name">{{ postsQuery.selectedPost()?.name ?? 'empty' }}</p>
      `,
    })
    class SelectedPostComponent {
      readonly postsQuery = postsApi.useGetPostsQuery(undefined, {
        selectFromResult: ({ data }) => ({
          selectedPost: data?.find((post) => post.id === 1),
        }),
      });

      markEvaluation = selectedTemplateMarks.mark;

      constructor() {
        effect(() => {
          selectedNames.push(this.postsQuery.selectedPost()?.name ?? 'empty');
        });
      }
    }

    @Component({
      standalone: true,
      imports: [QueryActionsComponent, SelectedPostComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <lib-query-actions />
        <lib-selected-post />
      `,
    })
    class HostComponent {}

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(await screen.findByText('stable selected post')).toBeInTheDocument();
    expect(fetchCount).toBe(1);
    expect(selectedNames).toEqual(['empty', 'stable selected post']);
    const renderCountAfterLoad = selectedTemplateMarks.count();

    await user.click(screen.getByRole('button', { name: 'add unrelated' }));
    await waitFor(() => {
      expect(fetchCount).toBe(2);
      expect(screen.getByTestId('selected-name')).toHaveTextContent('stable selected post');
    });
    expect(selectedNames).toEqual(['empty', 'stable selected post']);
    expect(selectedTemplateMarks.count()).toBe(renderCountAfterLoad);

    await user.click(screen.getByRole('button', { name: 'update selected' }));

    await waitFor(() => {
      expect(fetchCount).toBe(3);
      expect(screen.getByTestId('selected-name')).toHaveTextContent('updated selected post');
    });
    expect(selectedNames).toEqual(['empty', 'stable selected post', 'updated selected post']);
    expect(selectedTemplateMarks.count()).toBeGreaterThan(renderCountAfterLoad);
  });

  test('exposes falsy values returned by selectFromResult', async () => {
    const postsApi = createPostsApi('querySelectedFalsyApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="selected-count">{{ postsQuery.selectedCount() }}</p>
        <p data-testid="selected-many">{{ postsQuery.hasMany() ? 'many' : 'not many' }}</p>
      `,
    })
    class HostComponent {
      readonly postsQuery = postsApi.useGetPostsQuery(undefined, {
        selectFromResult: ({ data }) => ({
          selectedCount: data ? data.length - 1 : -1,
          hasMany: data ? data.length > 1 : true,
        }),
      });
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await waitFor(() => {
      expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
      expect(screen.getByTestId('selected-many')).toHaveTextContent('not many');
    });
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

    await renderWithNoopStoreApi(HostComponent, postsApi);

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

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(await screen.findByText('queryFunctionOptionsApi-post-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'hide name' }));

    expect(await screen.findByText('hidden')).toBeInTheDocument();
  });
});
