import { computed } from '@angular/core';
import { signalStore, withComputed } from '@ngrx/signals';

import { withApi } from 'ngrx-rtk-query/signal-store';

import { postsApi } from './api';

export const PostsSignalStore = signalStore(
  { providedIn: 'root' },
  withApi(postsApi),
  withComputed((store) => {
    const selectedPostsState = store.getPostsState();

    return {
      selectedPostsCount: computed(() => selectedPostsState().data?.length ?? 0),
    };
  }),
);
