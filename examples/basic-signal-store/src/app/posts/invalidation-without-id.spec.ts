import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { createApi, fetchBaseQuery } from 'ngrx-rtk-query';
import { describe, expect, test, vi } from 'vitest';

import { withApi } from 'ngrx-rtk-query/signal-store';

import { server } from '../../mocks/node';

describe('invalidatesTags without id (#99)', () => {
  const queryFn = vi.fn();

  const api = createApi({
    reducerPath: 'issueApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://api.localhost.com' }),
    tagTypes: ['Resource'],
    endpoints: (build) => ({
      getResource: build.query<{ value: number }, void>({
        query: () => '/resource',
        providesTags: (result) => (result ? [{ type: 'Resource' }] : []),
      }),
      deleteResource: build.mutation<{ success: boolean }, void>({
        query: () => ({ url: '/resource', method: 'DELETE' }),
        invalidatesTags: ['Resource'],
      }),
    }),
  });

  const { useGetResourceQuery, useDeleteResourceMutation } = api;
  const SignalStoreRuntime = signalStore(withApi(api));

  @Component({
    selector: 'app-test-host',
    standalone: true,
    template: `
      @if (query.isLoading()) {
        <span>Loading</span>
      }
      @if (query.data(); as data) {
        <span data-testid="value">{{ data.value }}</span>
      }
      <button (click)="deleteMutation()">Delete</button>
      @if (deleteMutation.isLoading()) {
        <span>Deleting</span>
      }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class TestHostComponent {
    readonly runtime = inject(SignalStoreRuntime);
    readonly query = useGetResourceQuery();
    readonly deleteMutation = useDeleteResourceMutation();
  }

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    server.resetHandlers();
    queryFn.mockClear();
  });
  afterAll(() => server.close());

  test('refetches the query exactly once after invalidating a tag type without id', async () => {
    let callCount = 0;

    server.use(
      http.get('http://api.localhost.com/resource', () => {
        callCount++;
        queryFn();
        return HttpResponse.json({ value: callCount });
      }),
      http.delete('http://api.localhost.com/resource', () => {
        return HttpResponse.json({ success: true });
      }),
    );

    const user = userEvent.setup();
    await render(TestHostComponent, {
      providers: [SignalStoreRuntime],
    });

    expect(await screen.findByTestId('value')).toHaveTextContent('1');
    expect(queryFn).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /Delete/i }));

    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(queryFn).toHaveBeenCalledTimes(2);
  });
});
