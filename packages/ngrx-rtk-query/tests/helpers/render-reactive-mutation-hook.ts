import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import userEvent from '@testing-library/user-event';

import { createPostsApi } from './create-posts-api';
import { renderWithNoopStoreApi } from './render-with-noop-store-api';

export const renderReactiveMutationHook = async (
  reducerPath: string,
  optionsMode: 'function' | 'signal' = 'function',
) => {
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

  await renderWithNoopStoreApi(HostComponent, postsApi);

  return { user };
};
