import { ChangeDetectionStrategy, Component, EnvironmentInjector, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideStore } from '@ngrx/store';
import { render, screen } from '@testing-library/angular';
import { describe, expect, test, vi } from 'vitest';

import { provideStoreApi } from 'ngrx-rtk-query/store';

import { createPostsApi } from '../helpers/create-posts-api';

describe('provideStoreApi', () => {
  test('allocates a distinct binding key per environment injector when providers are reused', () => {
    const postsApi = createPostsApi('storeSharedProvidersApi');
    const providers = [provideStore(), provideStoreApi(postsApi)];

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
    const postsApi = createPostsApi('storeDirectSelectionApi');

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
      providers: [provideStore(), provideStoreApi(postsApi)],
    });

    expect(screen.getByTestId('selected-status')).toHaveTextContent('uninitialized');
  });

  test('releases api binding when setupListeners fails after initApiStore succeeds', async () => {
    const postsApi = createPostsApi('storeFailureApi');
    const failingSetupListeners = vi.fn(() => {
      throw new Error('setupListeners failed');
    });

    @Component({
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        store-failing-runtime
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
        providers: [provideStore(), provideStoreApi(postsApi, { setupListeners: failingSetupListeners })],
      }),
    ).rejects.toThrow(/setupListeners failed/);

    expect(failingSetupListeners).toHaveBeenCalledTimes(1);

    TestBed.resetTestingModule();

    await render(RecoveryHostComponent, {
      providers: [provideStore(), provideStoreApi(postsApi)],
    });

    expect(screen.getByTestId('selected-status')).toHaveTextContent('uninitialized');
  });
});
