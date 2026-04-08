import { ChangeDetectionStrategy, Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { createApi, fetchBaseQuery } from 'ngrx-rtk-query';
import { describe, expect, test, vi } from 'vitest';

import { provideNoopStoreApi } from 'ngrx-rtk-query/noop-store';

import { server } from '../../mocks/node';

/**
 * Regression test for https://github.com/SaulMoro/ngrx-rtk-query/issues/99
 *
 * Verifies that `invalidatesTags` without `id` causes exactly one refetch,
 * not two.
 */
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
    readonly query = useGetResourceQuery();
    readonly deleteMutation = useDeleteResourceMutation();
  }

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    server.resetHandlers();
    queryFn.mockClear();
  });
  afterAll(() => server.close());

  test('mutation invalidation without id should refetch the query exactly once', async () => {
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
      providers: [provideNoopStoreApi(api)],
    });

    // Wait for initial query to complete
    expect(await screen.findByTestId('value')).toHaveTextContent('1');
    expect(queryFn).toHaveBeenCalledTimes(1);

    // Trigger mutation that invalidates ['Resource'] (no id)
    await user.click(screen.getByRole('button', { name: /Delete/i }));

    // Wait for the refetch to complete — value should update to 2
    expect(await screen.findByText('2')).toBeInTheDocument();

    // The query should have been called exactly twice: initial + one refetch
    // If this is 3, the query was refetched twice (the reported bug)
    expect(queryFn).toHaveBeenCalledTimes(2);
  });
});
