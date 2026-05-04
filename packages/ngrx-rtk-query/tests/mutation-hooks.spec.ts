import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { createApi, fakeBaseQuery } from 'ngrx-rtk-query/core';
import { provideNoopStoreApi } from 'ngrx-rtk-query/noop-store';

import { createPostsApi } from './helpers/create-posts-api';

type MutationOptionsMode = 'function' | 'signal';

async function renderReactiveMutationHook(reducerPath: string, optionsMode: MutationOptionsMode = 'function') {
  const postsApi = createPostsApi(reducerPath);
  const user = userEvent.setup();

  @Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <button (click)="saveCurrent()">save current</button>
      <button (click)="activeId.set(2)">next</button>
      <button (click)="activeId.set(1)">previous</button>
      <button (click)="addPost.reset()">reset current</button>
      <p data-testid="mutation-name">{{ addPost.data()?.name ?? 'empty' }}</p>
    `,
  })
  class HostComponent {
    readonly activeId = signal(1);
    readonly mutationOptions = computed(() => ({ fixedCacheKey: `save:${this.activeId()}` }));
    readonly addPost =
      optionsMode === 'signal'
        ? postsApi.useAddPostMutation(this.mutationOptions)
        : postsApi.useAddPostMutation(() => ({ fixedCacheKey: `save:${this.activeId()}` }));

    saveCurrent() {
      this.addPost({ name: `Saved for ${this.activeId()}` });
    }
  }

  await render(HostComponent, {
    providers: [provideNoopStoreApi(postsApi)],
  });

  return { user };
}

describe('mutation hooks', () => {
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

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

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

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

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

    const { rerender } = await render(HostComponent, {
      componentInputs: { activeId: 1 },
      providers: [provideNoopStoreApi(postsApi)],
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

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

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

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

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

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(screen.getByTestId('selected-name')).toHaveTextContent('empty');

    await user.click(screen.getByRole('button', { name: 'save current' }));
    await waitFor(() => {
      expect(screen.getByTestId('selected-name')).toHaveTextContent('Saved');
    });
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

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

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
});
