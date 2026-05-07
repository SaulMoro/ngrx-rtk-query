import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { createApi, fakeBaseQuery } from 'ngrx-rtk-query/core';

import { type Post, createDeferred, createPostsApi } from './helpers/create-posts-api';
import { renderReactiveMutationHook } from './helpers/render-reactive-mutation-hook';
import { renderWithNoopStoreApi } from './helpers/render-with-noop-store-api';
import { createTemplateEvaluationMarks } from './helpers/template-evaluation-marks';

describe('mutation hooks', () => {
  test('loads fulfilled data from a static mutation trigger', async () => {
    const postsApi = createPostsApi('staticMutationTriggerApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="addPost({ name: 'Saved' })">save</button>
        <p data-testid="mutation-name">{{ addPost.data()?.name ?? 'empty' }}</p>
        <p>{{ addPost.isSuccess() ? 'success' : 'not success' }}</p>
      `,
    })
    class HostComponent {
      readonly addPost = postsApi.useAddPostMutation();
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByTestId('mutation-name')).toHaveTextContent('empty');
    expect(screen.getByText('not success')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved');
      expect(screen.getByText('success')).toBeInTheDocument();
    });
  });

  test('tracks mutation state through function-based reactive fixedCacheKey options', async () => {
    const { user } = await renderReactiveMutationHook('reactiveMutationFunctionOptionsApi');

    expect(screen.getByTestId('mutation-name')).toHaveTextContent('empty');

    await user.click(screen.getByRole('button', { name: 'save current' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 1');
    });

    await user.click(screen.getByRole('button', { name: 'next' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('empty');
    });

    await user.click(screen.getByRole('button', { name: 'previous' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 1');
    });
  });

  test('uses current function-based fixedCacheKey options when triggering a mutation', async () => {
    const { user } = await renderReactiveMutationHook('reactiveMutationTriggerOptionsApi');

    await user.click(screen.getByRole('button', { name: 'next' }));
    await user.click(screen.getByRole('button', { name: 'save current' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 2');
    });

    await user.click(screen.getByRole('button', { name: 'previous' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('empty');
    });

    await user.click(screen.getByRole('button', { name: 'next' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 2');
    });
  });

  test('uses function-based fixedCacheKey options for synchronous mutation triggers', async () => {
    const postsApi = createPostsApi('reactiveMutationSyncTriggerOptionsApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="activeId.set(2)">next</button>
        <button (click)="activeId.set(1)">previous</button>
        <p data-testid="mutation-name">{{ addPost.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly activeId = signal(1);
      readonly addPost = postsApi.useAddPostMutation(() => ({ fixedCacheKey: `save:${this.activeId()}` }));

      constructor() {
        this.addPost({ name: 'Saved for 1' });
      }
    }

    const user = userEvent.setup();

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 1');
    });

    await user.click(screen.getByRole('button', { name: 'next' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('empty');
    });

    await user.click(screen.getByRole('button', { name: 'previous' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 1');
    });
  });

  test('uses computed fixedCacheKey options for synchronous mutation triggers', async () => {
    const postsApi = createPostsApi('reactiveMutationSyncSignalOptionsApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="activeId.set(2)">next</button>
        <button (click)="activeId.set(1)">previous</button>
        <p data-testid="mutation-name">{{ addPost.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly activeId = signal(1);
      readonly mutationOptions = computed(() => ({ fixedCacheKey: `save:${this.activeId()}` }));
      readonly addPost = postsApi.useAddPostMutation(this.mutationOptions);

      constructor() {
        this.addPost({ name: 'Saved for 1' });
      }
    }

    const user = userEvent.setup();

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 1');
    });

    await user.click(screen.getByRole('button', { name: 'next' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('empty');
    });

    await user.click(screen.getByRole('button', { name: 'previous' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 1');
    });
  });

  test('accepts computed mutation options signals', async () => {
    const { user } = await renderReactiveMutationHook('reactiveMutationSignalOptionsApi', 'signal');

    await user.click(screen.getByRole('button', { name: 'save current' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 1');
    });

    await user.click(screen.getByRole('button', { name: 'next' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('empty');
    });

    await user.click(screen.getByRole('button', { name: 'previous' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 1');
    });
  });

  test('supports function-based mutation options derived from required inputs', async () => {
    const postsApi = createPostsApi('reactiveMutationRequiredInputOptionsApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="saveCurrent()">save current</button>
        <p data-testid="mutation-name">{{ addPost.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly activeId = input.required<number>();
      readonly addPost = postsApi.useAddPostMutation(() => ({ fixedCacheKey: `save:${this.activeId()}` }));

      saveCurrent() {
        this.addPost({ name: `Saved for ${this.activeId()}` });
      }
    }

    const { rerender } = await renderWithNoopStoreApi(HostComponent, postsApi, {
      componentInputs: { activeId: 1 },
    });

    await user.click(screen.getByRole('button', { name: 'save current' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 1');
    });

    await rerender({ componentInputs: { activeId: 2 } });
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('empty');
    });

    await user.click(screen.getByRole('button', { name: 'save current' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 2');
    });

    await rerender({ componentInputs: { activeId: 1 } });
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 1');
    });
  });

  test('tracks error state through reactive fixedCacheKey options', async () => {
    const postsApi = createApi({
      reducerPath: 'reactiveMutationErrorOptionsApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        savePost: build.mutation<{ id: number; name: string }, { name: string; shouldFail?: boolean }>({
          queryFn: async ({ name, shouldFail }) =>
            shouldFail
              ? {
                  error: {
                    status: 400,
                    data: name,
                  },
                }
              : {
                  data: { id: 1, name },
                },
        }),
      }),
    });
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="failCurrent()">fail current</button>
        <button (click)="activeId.set(2)">next</button>
        <button (click)="activeId.set(1)">previous</button>
        <p data-testid="mutation-state">
          {{ savePost.isError() ? 'error' : (savePost.data()?.name ?? 'empty') }}
        </p>
      `,
    })
    class HostComponent {
      readonly activeId = signal(1);
      readonly savePost = postsApi.useSavePostMutation(() => ({ fixedCacheKey: `save:${this.activeId()}` }));

      failCurrent() {
        this.savePost({ name: `Failed for ${this.activeId()}`, shouldFail: true });
      }
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByTestId('mutation-state')).toHaveTextContent('empty');

    await user.click(screen.getByRole('button', { name: 'fail current' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-state')).toHaveTextContent('error');
    });

    await user.click(screen.getByRole('button', { name: 'next' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-state')).toHaveTextContent('empty');
    });

    await user.click(screen.getByRole('button', { name: 'previous' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-state')).toHaveTextContent('error');
    });
  });

  test('tracks reactive selectFromResult mutation options', async () => {
    const postsApi = createPostsApi('reactiveMutationSelectFromResultApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="saveCurrent()">save current</button>
        <button (click)="showName.set(false)">hide name</button>
        <button (click)="showName.set(true)">show name</button>
        <p data-testid="selected-name">{{ addPost.selectedName() }}</p>
      `,
    })
    class HostComponent {
      readonly showName = signal(true);
      readonly addPost = postsApi.useAddPostMutation(() => ({
        fixedCacheKey: 'select-from-result',
        selectFromResult: ({ data }) => ({
          selectedName: this.showName() ? (data?.name ?? 'empty') : 'hidden',
        }),
      }));

      saveCurrent() {
        this.addPost({ name: 'Saved' });
      }
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByTestId('selected-name')).toHaveTextContent('empty');

    await user.click(screen.getByRole('button', { name: 'save current' }));
    await waitFor(() => {
      expect(screen.getByTestId('selected-name')).toHaveTextContent('Saved');
    });

    await user.click(screen.getByRole('button', { name: 'hide name' }));
    await waitFor(() => {
      expect(screen.getByTestId('selected-name')).toHaveTextContent('hidden');
    });

    await user.click(screen.getByRole('button', { name: 'show name' }));
    await waitFor(() => {
      expect(screen.getByTestId('selected-name')).toHaveTextContent('Saved');
    });
  });

  test('exposes falsy values returned by mutation selectFromResult', async () => {
    const postsApi = createPostsApi('mutationSelectedFalsyApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="saveCurrent()">save current</button>
        <p data-testid="selected-count">{{ addPost.selectedCount() }}</p>
        <p data-testid="selected-many">{{ addPost.hasMany() ? 'many' : 'not many' }}</p>
      `,
    })
    class HostComponent {
      readonly addPost = postsApi.useAddPostMutation({
        fixedCacheKey: 'selected-falsy',
        selectFromResult: ({ data }) => ({
          selectedCount: data?.id === 1 ? 0 : -1,
          hasMany: data?.name === 'Saved' ? false : true,
        }),
      });

      saveCurrent() {
        this.addPost({ name: 'Saved' });
      }
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'save current' }));

    await waitFor(() => {
      expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
      expect(screen.getByTestId('selected-many')).toHaveTextContent('not many');
    });
  });

  test('exposes selected mutation result keys that collide with function properties', async () => {
    const postsApi = createPostsApi('mutationSelectedFunctionPropertyApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="saveCurrent()">save current</button>
        <p data-testid="selected-name">{{ addPost.name() }}</p>
      `,
    })
    class HostComponent {
      readonly addPost = postsApi.useAddPostMutation({
        fixedCacheKey: 'selected-name',
        selectFromResult: ({ data }) => ({
          name: data?.name ?? 'empty',
        }),
      });

      saveCurrent() {
        this.addPost({ name: 'Saved' });
      }
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByTestId('selected-name')).toHaveTextContent('empty');

    await user.click(screen.getByRole('button', { name: 'save current' }));
    await waitFor(() => {
      expect(screen.getByTestId('selected-name')).toHaveTextContent('Saved');
    });
  });

  test('does not emit selected mutation state when selectFromResult returns a stable value', async () => {
    const selectedLabels: string[] = [];
    const selectedTemplateMarks = createTemplateEvaluationMarks();
    const postsApi = createPostsApi('mutationSelectedStableApi');
    const user = userEvent.setup();

    @Component({
      selector: 'lib-mutation-actions',
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="savePost('First')">save first</button>
        <button (click)="savePost('Second')">save second</button>
        <p data-testid="mutation-completions">{{ mutationCompletions() }}</p>
      `,
    })
    class MutationActionsComponent {
      readonly mutationCompletions = signal(0);
      readonly addPost = postsApi.useAddPostMutation({ fixedCacheKey: 'stable-selection' });

      async savePost(name: string) {
        await this.addPost({ name });
        this.mutationCompletions.update((value) => value + 1);
      }
    }

    @Component({
      selector: 'lib-selected-mutation-state',
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <span hidden>{{ markEvaluation() }}</span>
        <p data-testid="selected-label">{{ addPost.selectedLabel() }}</p>
      `,
    })
    class SelectedMutationStateComponent {
      readonly addPost = postsApi.useAddPostMutation({
        fixedCacheKey: 'stable-selection',
        selectFromResult: () => ({
          selectedLabel: 'stable',
        }),
      });
      markEvaluation = selectedTemplateMarks.mark;

      constructor() {
        effect(() => {
          selectedLabels.push(this.addPost.selectedLabel());
        });
      }
    }

    @Component({
      standalone: true,
      imports: [MutationActionsComponent, SelectedMutationStateComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <lib-mutation-actions />
        <lib-selected-mutation-state />
      `,
    })
    class HostComponent {}

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByTestId('selected-label')).toHaveTextContent('stable');
    expect(selectedLabels).toEqual(['stable']);
    const renderCountAfterMount = selectedTemplateMarks.count();

    await user.click(screen.getByRole('button', { name: 'save first' }));
    await user.click(screen.getByRole('button', { name: 'save second' }));

    await waitFor(() => {
      expect(screen.getByTestId('mutation-completions')).toHaveTextContent('2');
      expect(screen.getByTestId('selected-label')).toHaveTextContent('stable');
    });
    expect(selectedLabels).toEqual(['stable']);
    expect(selectedTemplateMarks.count()).toBe(renderCountAfterMount);
  });

  test('exposes and resets originalArgs for mutations without fixedCacheKey', async () => {
    const postsApi = createPostsApi('mutationOriginalArgsApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="saveCurrent()">save current</button>
        <button (click)="addPost.reset()">reset current</button>
        <p data-testid="mutation-name">{{ addPost.data()?.name ?? 'empty' }}</p>
        <p data-testid="original-name">{{ addPost.originalArgs()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly addPost = postsApi.useAddPostMutation();

      saveCurrent() {
        this.addPost({ name: 'Saved' });
      }
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByTestId('mutation-name')).toHaveTextContent('empty');
    expect(screen.getByTestId('original-name')).toHaveTextContent('empty');

    await user.click(screen.getByRole('button', { name: 'save current' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved');
      expect(screen.getByTestId('original-name')).toHaveTextContent('Saved');
    });

    await user.click(screen.getByRole('button', { name: 'reset current' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('empty');
      expect(screen.getByTestId('original-name')).toHaveTextContent('empty');
    });
  });

  test('does not expose originalArgs for mutations with fixedCacheKey', async () => {
    const postsApi = createPostsApi('mutationFixedCacheKeyOriginalArgsApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="saveCurrent()">save current</button>
        <p data-testid="mutation-name">{{ addPost.data()?.name ?? 'empty' }}</p>
        <p data-testid="original-name">{{ addPost.originalArgs()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly addPost = postsApi.useAddPostMutation({ fixedCacheKey: 'fixed-original-args' });

      saveCurrent() {
        this.addPost({ name: 'Saved' });
      }
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'save current' }));

    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved');
      expect(screen.getByTestId('original-name')).toHaveTextContent('empty');
    });
  });

  test('does not reset previous fixedCacheKey buckets when reactive options change', async () => {
    const { user } = await renderReactiveMutationHook('reactiveMutationNoAutoResetApi');

    await user.click(screen.getByRole('button', { name: 'save current' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 1');
    });

    await user.click(screen.getByRole('button', { name: 'next' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('empty');
    });

    await user.click(screen.getByRole('button', { name: 'save current' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 2');
    });

    await user.click(screen.getByRole('button', { name: 'reset current' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('empty');
    });

    await user.click(screen.getByRole('button', { name: 'previous' }));
    await waitFor(() => {
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('Saved for 1');
    });
  });

  test('shares fixedCacheKey state across mutation hook instances', async () => {
    const postsApi = createPostsApi('mutationSharedFixedCacheKeyApi');
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="firstAddPost({ name: 'Saved by first' })">save first</button>
        <p data-testid="first-mutation-name">{{ firstAddPost.data()?.name ?? 'empty' }}</p>
        <p data-testid="second-mutation-name">{{ secondAddPost.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly firstAddPost = postsApi.useAddPostMutation({ fixedCacheKey: 'shared-save' });
      readonly secondAddPost = postsApi.useAddPostMutation({ fixedCacheKey: 'shared-save' });
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    expect(screen.getByTestId('first-mutation-name')).toHaveTextContent('empty');
    expect(screen.getByTestId('second-mutation-name')).toHaveTextContent('empty');

    await user.click(screen.getByRole('button', { name: 'save first' }));

    await waitFor(() => {
      expect(screen.getByTestId('first-mutation-name')).toHaveTextContent('Saved by first');
      expect(screen.getByTestId('second-mutation-name')).toHaveTextContent('Saved by first');
    });
  });

  test('keeps observing the latest trigger when concurrent mutations resolve out of order', async () => {
    const firstPost = createDeferred<Post>('First mutation');
    const secondPost = createDeferred<Post>('Second mutation');
    const completedNames: string[] = [];
    const postsApi = createApi({
      reducerPath: 'mutationConcurrentTriggerApi',
      baseQuery: fakeBaseQuery(),
      endpoints: (build) => ({
        savePost: build.mutation<Post, { name: string }>({
          queryFn: async ({ name }) => {
            const post = await (name === 'first' ? firstPost.promise : secondPost.promise);
            completedNames.push(name);
            return { data: post };
          },
        }),
      }),
    });
    const user = userEvent.setup();

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <button (click)="savePost({ name: 'first' })">save first</button>
        <button (click)="savePost({ name: 'second' })">save second</button>
        <p data-testid="mutation-name">{{ savePost.data()?.name ?? 'empty' }}</p>
      `,
    })
    class HostComponent {
      readonly savePost = postsApi.useSavePostMutation();
    }

    await renderWithNoopStoreApi(HostComponent, postsApi);

    await user.click(screen.getByRole('button', { name: 'save first' }));
    await user.click(screen.getByRole('button', { name: 'save second' }));

    secondPost.resolve({ id: 2, name: 'second' });

    await waitFor(() => {
      expect(completedNames).toContain('second');
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('second');
    });

    firstPost.resolve({ id: 1, name: 'first' });

    await waitFor(() => {
      expect(completedNames).toContain('first');
      expect(screen.getByTestId('mutation-name')).toHaveTextContent('second');
    });
    expect(screen.queryByText('first')).not.toBeInTheDocument();
  });
});
