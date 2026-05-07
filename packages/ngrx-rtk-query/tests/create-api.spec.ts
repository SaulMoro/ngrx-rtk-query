import { type UnknownAction } from '@reduxjs/toolkit';
import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  type AngularHooksModuleOptions,
  type Dispatch,
  type ɵInternalRuntimeMountApi,
  ɵinternalMountRuntimeApi,
} from 'ngrx-rtk-query/core';

import { createPostsApi } from './helpers/create-posts-api';
import { recordRuntimeLifecycle } from './helpers/record-runtime-lifecycle';

type InitializedTestApi = ReturnType<typeof createPostsApi> & {
  dispatch: Dispatch;
  initApiStore: (
    setupFn: () => AngularHooksModuleOptions,
    bindingMetadata: {
      runtimeLabel: string;
    },
  ) => () => void;
};

const unusedUseSelector = (() => {
  throw new Error('useSelector should not be called in create-api tests');
}) as AngularHooksModuleOptions['hooks']['useSelector'];

const createTestStoreSetup = (postsApi: InitializedTestApi) => {
  let currentState = postsApi.reducer(undefined, {
    type: '@@ngrx-rtk-query/test/init',
  });

  return () =>
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
    }) satisfies AngularHooksModuleOptions;
};

const initBoundTestApiStore = (postsApi: InitializedTestApi) => {
  return {
    releaseApiStore: postsApi.initApiStore(createTestStoreSetup(postsApi), {
      runtimeLabel: 'create-api-test',
    }),
  };
};

describe('createApi', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('allows resetting the api before any host store is bound', () => {
    const postsApi = createPostsApi('unboundApi') as InitializedTestApi;

    expect(() => postsApi.dispatch(postsApi.util.resetApiState())).not.toThrow();
  });

  test('unbinds the api when the host store is released', () => {
    const postsApi = createPostsApi('releasedApi') as InitializedTestApi;
    const { releaseApiStore } = initBoundTestApiStore(postsApi);

    expect(() => postsApi.dispatch(postsApi.util.resetApiState())).not.toThrow();

    releaseApiStore();

    expect(() => postsApi.dispatch(postsApi.util.resetApiState())).not.toThrow();

    expect(() => postsApi.dispatch({ type: 'releasedApi/customAction' })).toThrow(
      /Provide the API \(releasedApi\) is necessary to use the queries/,
    );
  });

  test('allows resetting the api after the host store is released even with pending middleware work', async () => {
    vi.useFakeTimers();

    const postsApi = createPostsApi('releasedTimerApi') as InitializedTestApi;
    const { releaseApiStore } = initBoundTestApiStore(postsApi);

    postsApi.dispatch(postsApi.endpoints.getPosts.initiate());
    postsApi.dispatch(postsApi.util.resetApiState());
    releaseApiStore();

    await vi.advanceTimersByTimeAsync(500);

    expect(() => postsApi.dispatch(postsApi.util.resetApiState())).not.toThrow();

    expect(() => postsApi.dispatch({ type: 'releasedTimerApi/customAction' })).toThrow(
      /Provide the API \(releasedTimerApi\) is necessary to use the queries/,
    );
  });

  test('does not let a stale release clear a newer binding', () => {
    const postsApi = createPostsApi('staleReleaseApi') as InitializedTestApi;
    const releaseFirst = postsApi.initApiStore(createTestStoreSetup(postsApi), {
      runtimeLabel: 'first-test-host',
    });
    releaseFirst();
    const releaseSecond = postsApi.initApiStore(createTestStoreSetup(postsApi), {
      runtimeLabel: 'second-test-host',
    });

    releaseFirst();

    expect(() => postsApi.dispatch({ type: 'staleReleaseApi/customAction' })).not.toThrow();

    releaseSecond();

    expect(() => postsApi.dispatch({ type: 'staleReleaseApi/customAction' })).toThrow(
      /Provide the API \(staleReleaseApi\) is necessary to use the queries/,
    );
  });

  test('does not reset again when runtime release is called more than once', () => {
    const postsApi = createPostsApi('idempotentRuntimeReleaseApi') as InitializedTestApi & ɵInternalRuntimeMountApi;
    const { events, setupListeners } = recordRuntimeLifecycle(postsApi);
    const releaseRuntime = ɵinternalMountRuntimeApi({
      api: postsApi,
      setupFn: createTestStoreSetup(postsApi),
      runtimeLabel: 'create-api-test',
      setupListeners,
    });

    releaseRuntime();
    releaseRuntime();

    expect(events).toEqual(['listeners', 'teardown', 'reset']);
  });
});
