import { type UnknownAction } from '@reduxjs/toolkit';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { type AngularHooksModuleOptions, type Dispatch } from 'ngrx-rtk-query/core';

import { createPostsApi } from './helpers/create-posts-api';

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

const unusedUseSelector = (() => {
  throw new Error('useSelector should not be called in create-api tests');
}) as AngularHooksModuleOptions['hooks']['useSelector'];

const initBoundTestApiStore = (postsApi: InitializedTestApi) => {
  let currentState = postsApi.reducer(undefined, {
    type: '@@ngrx-rtk-query/test/init',
  });

  return {
    releaseApiStore: postsApi.initApiStore(
      () =>
        ({
          hooks: {
            dispatch: ((action: UnknownAction) => {
              currentState = postsApi.reducer(currentState, action);
              return action;
            }) as Dispatch,
            getState: () => ({ [postsApi.reducerPath]: currentState }),
            useSelector: unusedUseSelector,
          },
          createSelector: () => (() => undefined) as never,
          getInjector: () => ({}) as never,
        }) satisfies AngularHooksModuleOptions,
      {
        bindingKey: {},
        runtimeLabel: 'create-api-test',
      },
    ),
  };
};

describe('createApi', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('unbinds the api when the host store is released', () => {
    const postsApi = createPostsApi('releasedApi') as InitializedTestApi;
    const { releaseApiStore } = initBoundTestApiStore(postsApi);

    expect(() => postsApi.dispatch(postsApi.util.resetApiState())).not.toThrow();

    releaseApiStore();

    expect(() => postsApi.dispatch(postsApi.util.resetApiState())).toThrow(
      /Provide the API \(releasedApi\) is necessary to use the queries/,
    );
  });

  test('ignores delayed middleware next work after reset and release', async () => {
    vi.useFakeTimers();

    const postsApi = createPostsApi('releasedTimerApi') as InitializedTestApi;
    const { releaseApiStore } = initBoundTestApiStore(postsApi);

    postsApi.dispatch(postsApi.endpoints.getPosts.initiate());
    postsApi.dispatch(postsApi.util.resetApiState());
    releaseApiStore();

    await vi.advanceTimersByTimeAsync(500);

    expect(() => postsApi.dispatch(postsApi.util.resetApiState())).toThrow(
      /Provide the API \(releasedTimerApi\) is necessary to use the queries/,
    );
  });
});
