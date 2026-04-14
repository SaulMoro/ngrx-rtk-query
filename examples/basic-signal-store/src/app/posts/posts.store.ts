import { computed } from '@angular/core';
import { signalStore, withComputed, withProps } from '@ngrx/signals';

import { withApi, withApiState } from 'ngrx-rtk-query/signal-store';

import { postsApi } from './api';

export const PostsSignalStore = signalStore(
  { providedIn: 'root' },
  withApi(postsApi),
  withApiState(postsApi),
  withProps((store) => ({
    selectedPostsState: store.getPostsState(),
  })),
  withComputed(({ selectedPostsState }) => ({
    selectedPostsCount: computed(() => selectedPostsState().data?.length ?? 0),
  })),
);
