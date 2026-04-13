import { ChangeDetectionStrategy, Component, EnvironmentInjector, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import { describe, expect, test, vi } from 'vitest';

import { ApiStore } from 'ngrx-rtk-query/noop-store';
import { provideNoopStoreApi } from 'ngrx-rtk-query/noop-store';

import { createPostsApi } from '../helpers/create-posts-api';

describe('provideNoopStoreApi', () => {
  test('allocates a distinct binding key per environment injector when providers are reused', () => {
    const postsApi = createPostsApi('noopSharedProvidersApi');
    const providers = [provideNoopStoreApi(postsApi)];

    TestBed.configureTestingModule({});
    const parent = TestBed.inject(EnvironmentInjector);
    const firstEnvironment = createEnvironmentInjector(providers, parent);

    try {
      expect(() => createEnvironmentInjector(providers, parent)).toThrow(/already bound to another host/);
    } finally {
      firstEnvironment.destroy();
    }

    const secondEnvironment = createEnvironmentInjector(providers, parent);
    secondEnvironment.destroy();
  });

  test('supports selecting endpoint state directly before any query hook mounts', async () => {
    const postsApi = createPostsApi('noopDirectSelectionApi');

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="selected-status">{{ selectedPosts().status }}</p>
      `,
    })
    class HostComponent {
      readonly selectedPosts = postsApi.selectSignal(postsApi.endpoints.getPosts.select());
    }

    await render(HostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(screen.getByTestId('selected-status')).toHaveTextContent('uninitialized');
  });

  test('does not update root state when the reducer returns the same slice reference', () => {
    TestBed.configureTestingModule({
      providers: [ApiStore],
    });
    const store = TestBed.inject(ApiStore);

    store.state.set({ noop: {} });

    const initialState = store.state();
    store.dispatch({ type: 'noop' }, { reducerPath: 'noop', reducer: (state = {}) => state });

    expect(store.state()).toBe(initialState);
  });

  test('releases api binding when setupListeners fails after initApiStore succeeds', async () => {
    const postsApi = createPostsApi('noopFailureApi');
    const failingSetupListeners = vi.fn(() => {
      throw new Error('setupListeners failed');
    });

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        noop-failing-runtime
      `,
    })
    class FailingHostComponent {}

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <p data-testid="selected-status">{{ selectedPosts().status }}</p>
      `,
    })
    class RecoveryHostComponent {
      readonly selectedPosts = postsApi.selectSignal(postsApi.endpoints.getPosts.select());
    }

    await expect(
      render(FailingHostComponent, {
        providers: [provideNoopStoreApi(postsApi, { setupListeners: failingSetupListeners })],
      }),
    ).rejects.toThrow(/setupListeners failed/);

    expect(failingSetupListeners).toHaveBeenCalledTimes(1);

    TestBed.resetTestingModule();

    await render(RecoveryHostComponent, {
      providers: [provideNoopStoreApi(postsApi)],
    });

    expect(screen.getByTestId('selected-status')).toHaveTextContent('uninitialized');
  });
});
