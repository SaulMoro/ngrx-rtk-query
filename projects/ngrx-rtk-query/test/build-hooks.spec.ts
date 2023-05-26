import { QueryStatus, skipToken } from '@reduxjs/toolkit/query';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { dispatch, getState } from '../src/lib/thunk.service';
import { actionsReducer, expectExactType, setupApiStore, waitMs } from './helper';
import { api, defaultApi, invalidationsApi, libPostsApi, mutationApi, resetAmount } from './helper-apis';
import * as HooksComponents from './helper-components';
import { resetPostsApi } from './mocks/lib-posts.handlers';
import { server } from './mocks/server';

describe.skip('hooks tests', () => {
  const storeRef = setupApiStore(api, { ...actionsReducer(api.reducerPath) });

  let getRenderCount: () => number = () => 0;

  beforeEach(() => {
    resetAmount();
  });

  describe('useQuery', () => {
    test('useQuery hook basic render count assumptions', async () => {
      const { fixture } = await render(HooksComponents.FetchingBaseComponent, { imports: storeRef.imports });

      const fetchControl = screen.getByTestId('isFetching');
      getRenderCount = fixture.componentInstance.renderCounter.getRenderCount;

      // By the time this runs, the initial render will happen, and the query
      //  will start immediately running by the time we can expect this
      expect(getRenderCount()).toBe(1);
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
      expect(getRenderCount()).toBe(2);
    });

    test('useQuery hook sets isFetching=true whenever a request is in flight', async () => {
      const { fixture } = await render(HooksComponents.FetchingComponent, { imports: storeRef.imports });

      const fetchControl = screen.getByTestId('isFetching');
      const incrementControl = screen.getByRole('button', { name: /Increment value/i });

      getRenderCount = fixture.componentInstance.renderCounter.getRenderCount;

      expect(getRenderCount()).toBe(1);

      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
      fireEvent.click(incrementControl); // setState = 1, perform request = 2
      await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
      expect(getRenderCount()).toBe(3);

      fireEvent.click(incrementControl);
      // Being that nothing has changed in the args, this should never fire.
      expect(fetchControl).toHaveTextContent('false');
      // even though there was no request, the button click updates the state so this is an expected render
      expect(getRenderCount()).toBe(4);
    });

    test('useQuery hook sets isLoading=true only on initial request', async () => {
      await render(HooksComponents.LoadingComponent, { imports: storeRef.imports });

      const loadingControl = screen.getByTestId('isLoading');
      const fetchControl = screen.getByTestId('isFetching');
      const incrementControl = screen.getByRole('button', { name: /Increment value/i });
      const refetchControl = screen.getByRole('button', { name: /Refetch/i });

      // Being that we skipped the initial request on mount, this should be false
      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));
      fireEvent.click(incrementControl);
      // Condition is met, should load
      await waitFor(() => expect(loadingControl).toHaveTextContent('true'));
      // Make sure the original loading has completed.
      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));
      fireEvent.click(incrementControl);
      // Being that we already have data, isLoading should be false
      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));
      // We call a refetch, should still be `false`
      fireEvent.click(refetchControl);
      await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));
    });

    test('useQuery hook sets isLoading and isFetching to the correct states', async () => {
      const { fixture } = await render(HooksComponents.FetchingLoadingComponent, { imports: storeRef.imports });
      getRenderCount = fixture.componentInstance.renderCounter.getRenderCount;

      const fetchControl = screen.getByTestId('isFetching');
      const loadingControl = screen.getByTestId('isLoading');
      const incrementControl = screen.getByRole('button', { name: /Increment value/i });
      const refetchControl = screen.getByRole('button', { name: /Refetch/i });

      expect(getRenderCount()).toBe(1);

      expect(loadingControl).toHaveTextContent('false');
      expect(fetchControl).toHaveTextContent('false');

      fireEvent.click(incrementControl); // renders: set state = 1, perform request = 2
      // Condition is met, should load
      await waitFor(() => expect(loadingControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchControl).toHaveTextContent('true'));

      // Make sure the request is done for sure.
      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
      expect(getRenderCount()).toBe(3);

      fireEvent.click(incrementControl);
      // Being that we already have data and changing the value doesn't trigger a new request,
      // only the button click should impact the render
      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
      expect(getRenderCount()).toBe(4);

      // We call a refetch, should set `isFetching` to true, then false when complete/errored
      fireEvent.click(refetchControl);
      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));
      await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
      expect(getRenderCount()).toBe(6);
    });

    test('`isLoading` does not jump back to true, while `isFetching` does', async () => {
      const { fixture } = await render(HooksComponents.FetchingLoadingAltComponent, {
        imports: storeRef.imports,
      });

      const statusControl = screen.getByTestId('status');
      const incrementControl = screen.getByRole('button', { name: /Increment value/i });

      await waitFor(() => expect(statusControl).toHaveTextContent('101'));

      // Increment user id
      fireEvent.click(incrementControl);
      await waitFor(() => expect(statusControl).toHaveTextContent('102'));

      expect(fixture.componentInstance.loadingHist).toEqual([true, false]);
      expect(fixture.componentInstance.fetchingHist).toEqual([true, false, true, false]);
    });

    test('useQuery hook respects refetchOnMountOrArgChange: true', async () => {
      const { rerender } = await render(HooksComponents.RefetchOnMountComponent, { imports: storeRef.imports });

      const fetchControl = screen.getByTestId('isFetching');
      const loadingControl = screen.getByTestId('isLoading');
      const amount = screen.getByTestId('amount');

      await waitFor(() => expect(loadingControl).toHaveTextContent('true'));
      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));

      await waitFor(() => expect(amount).toHaveTextContent('1'));

      rerender({
        componentProperties: {
          query$: api.endpoints.getIncrementedAmount.useQuery(undefined, {
            refetchOnMountOrArgChange: true,
          }),
        },
      });

      // Let's make sure we actually fetch, and we increment
      expect(loadingControl).toHaveTextContent('false');
      await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

      await waitFor(() => expect(amount).toHaveTextContent('2'));
    });

    test('useQuery does not refetch when refetchOnMountOrArgChange: NUMBER condition is not met', async () => {
      const { rerender } = await render(HooksComponents.RefetchOnMountComponent, {
        imports: storeRef.imports,
        componentProperties: {
          query$: api.endpoints.getIncrementedAmount.useQuery(undefined, {
            refetchOnMountOrArgChange: 10,
          }),
        },
      });

      const fetchControl = screen.getByTestId('isFetching');
      const loadingControl = screen.getByTestId('isLoading');
      const amount = screen.getByTestId('amount');

      await waitFor(() => expect(loadingControl).toHaveTextContent('true'));
      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));

      await waitFor(() => expect(amount).toHaveTextContent('1'));

      rerender({
        componentProperties: {
          query$: api.endpoints.getIncrementedAmount.useQuery(undefined, {
            refetchOnMountOrArgChange: 10,
          }),
        },
      });

      // Let's make sure we actually fetch, and we increment. Should be false because we do this immediately
      // and the condition is set to 10 seconds
      expect(fetchControl).toHaveTextContent('false');
      await waitFor(() => expect(amount).toHaveTextContent('1'));
    });

    test('useQuery refetches when refetchOnMountOrArgChange: NUMBER condition is met', async () => {
      const { rerender } = await render(HooksComponents.RefetchOnMountComponent, {
        imports: storeRef.imports,
        componentProperties: {
          query$: api.endpoints.getIncrementedAmount.useQuery(undefined, {
            refetchOnMountOrArgChange: 0.5,
          }),
        },
      });

      const fetchControl = screen.getByTestId('isFetching');
      const loadingControl = screen.getByTestId('isLoading');
      const amount = screen.getByTestId('amount');

      await waitFor(() => expect(loadingControl).toHaveTextContent('true'));
      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));

      await waitFor(() => expect(amount).toHaveTextContent('1'));

      // Wait to make sure we've passed the `refetchOnMountOrArgChange` value
      await waitMs(510);

      rerender({
        componentProperties: {
          query$: api.endpoints.getIncrementedAmount.useQuery(undefined, {
            refetchOnMountOrArgChange: 0.5,
          }),
        },
      });

      // Let's make sure we actually fetch, and we increment
      await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

      await waitFor(() => expect(amount).toHaveTextContent('2'));
    });

    test('refetchOnMountOrArgChange works as expected when changing skip from false->true', async () => {
      await render(HooksComponents.RefetchOnMountSkipComponent, { imports: storeRef.imports });

      const fetchControl = screen.getByTestId('isFetching');
      const loadingControl = screen.getByTestId('isLoading');
      const amount = screen.getByTestId('amount');
      const skipControl = screen.getByRole('button', { name: /change skip/i });

      expect(loadingControl).toHaveTextContent('false');
      expect(amount).toHaveTextContent('null');

      fireEvent.click(skipControl);

      await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

      await waitFor(() => expect(amount).toHaveTextContent('1'));
    });

    // eslint-disable-next-line max-len
    test('refetchOnMountOrArgChange works as expected when changing skip from false->true with a cached query', async () => {
      // 1. we need to mount a skipped query, then toggle skip to generate a cached result
      // 2. we need to mount a skipped component after that, then toggle skip as well. should pull from the cache.
      // 3. we need to mount another skipped component, then toggle skip after the specified
      //    duration and expect the time condition to be satisfied
      const { rerender } = await render(HooksComponents.RefetchOnMountSkipComponent, { imports: storeRef.imports });

      const fetchControl = screen.getByTestId('isFetching');
      const amount = screen.getByTestId('amount');
      const skipControl = screen.getByRole('button', { name: /change skip/i });

      expect(fetchControl).toHaveTextContent('false');

      // skipped queries do nothing by default, so we need to toggle that to get a cached result
      fireEvent.click(skipControl);

      await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
      await waitFor(() => expect(amount).toHaveTextContent('1'));
      expect(fetchControl).toHaveTextContent('false');

      // This will pull from the cache as the time criteria is not met.
      await waitMs(100);
      let skip = new BehaviorSubject<boolean>(true);
      let skip$ = skip.asObservable();

      rerender({
        componentProperties: {
          skip,
          skip$,
          query$: api.endpoints.getIncrementedAmount.useQuery(
            undefined,
            skip$.pipe(map((currentSkip) => ({ refetchOnMountOrArgChange: 0.5, skip: currentSkip }))),
          ),
        },
      });

      // skipped queries return nothing
      expect(fetchControl).toHaveTextContent('false');
      expect(amount).toHaveTextContent('null');

      // toggle skip -> true... won't refetch as the time critera is not met, and just loads the cached values
      fireEvent.click(skipControl);
      expect(fetchControl).toHaveTextContent('false');
      expect(amount).toHaveTextContent('1');

      await waitMs(500);
      skip = new BehaviorSubject<boolean>(true);
      skip$ = skip.asObservable();

      rerender({
        componentProperties: {
          skip,
          skip$,
          query$: api.endpoints.getIncrementedAmount.useQuery(
            undefined,
            skip$.pipe(map((currentSkip) => ({ refetchOnMountOrArgChange: 0.5, skip: currentSkip }))),
          ),
        },
      });

      // toggle skip -> true... will cause a refetch as the time criteria is now satisfied
      fireEvent.click(skipControl);

      await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

      await waitFor(() => expect(amount).toHaveTextContent('2'));
    });
  });

  // eslint-disable-next-line jest/expect-expect
  test(`useQuery refetches when query args object changes even if serialized args don't change`, async () => {
    await render(HooksComponents.ItemListComponent, { imports: storeRef.imports });

    await screen.findByText('ID: 0');

    fireEvent.click(screen.getByText('Next Page'));

    await screen.findByText('ID: 2');
  });

  describe('api.util.resetApiState resets hook', () => {
    test('without `selectFromResult`', async () => {
      const { fixture } = await render(HooksComponents.ResetApiStateComponent, { imports: storeRef.imports });

      await waitFor(() => expect(fixture.componentInstance.result?.isSuccess).toBe(true));

      void dispatch(api.util.resetApiState());

      expect(fixture.componentInstance.result).toEqual(
        expect.objectContaining({
          isError: false,
          isFetching: true,
          isLoading: true,
          isSuccess: false,
          isUninitialized: false,
          refetch: expect.any(Function),
          status: 'pending',
        }),
      );
    });

    test('with `selectFromResult`', async () => {
      const selectFromResult = jest.fn((x) => x);
      let result: any;
      await render(HooksComponents.ResetApiStateComponent, {
        componentProperties: {
          query$: api.endpoints.getUser
            .useQuery(5, { selectFromResult })
            .pipe(tap((currentResult) => (result = currentResult))),
          result,
        },
        imports: storeRef.imports,
      });

      await waitFor(() => expect(result?.isSuccess).toBe(true));
      selectFromResult.mockClear();
      void dispatch(api.util.resetApiState());

      expect(selectFromResult).toHaveBeenNthCalledWith(1, {
        isError: false,
        isFetching: false,
        isLoading: false,
        isSuccess: false,
        isUninitialized: true,
        status: 'uninitialized',
      });
    });
  });

  describe('useLazyQuery', () => {
    let data: any;

    afterEach(() => {
      data = undefined;
    });

    test('useLazyQuery does not automatically fetch when mounted and has undefined data', async () => {
      const { fixture } = await render(HooksComponents.LazyFetchingBaseComponent, { imports: storeRef.imports });
      getRenderCount = fixture.componentInstance.renderCounter.getRenderCount;
      data = fixture.componentInstance.data;

      const uninitializedControl = screen.getByTestId('isUninitialized');
      const fetchingControl = screen.getByTestId('isFetching');
      const fetchButton = screen.getByTestId('fetchButton');

      expect(getRenderCount()).toBe(1);

      await waitFor(() => expect(uninitializedControl).toHaveTextContent('true'));
      await waitFor(() => expect(data).toBeUndefined());

      fireEvent.click(fetchButton);
      expect(getRenderCount()).toBe(2);

      await waitFor(() => expect(uninitializedControl).toHaveTextContent('false'));
      await waitFor(() => expect(fetchingControl).toHaveTextContent('false'));
      expect(getRenderCount()).toBe(3);

      fireEvent.click(screen.getByTestId('fetchButton'));
      await waitFor(() => expect(fetchingControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchingControl).toHaveTextContent('false'));
      expect(getRenderCount()).toBe(5);
    });

    // eslint-disable-next-line max-len
    test('useLazyQuery accepts updated subscription options and only dispatches updateSubscriptionOptions when values are updated', async () => {
      const { fixture } = await render(HooksComponents.LazyFetchingComponent, { imports: storeRef.imports });
      getRenderCount = fixture.componentInstance.renderCounter.getRenderCount;
      data = fixture.componentInstance.data;

      const uninitializedControl = screen.getByTestId('isUninitialized');
      const fetchingControl = screen.getByTestId('isFetching');
      const fetchButton = screen.getByTestId('fetchButton');
      const updateOptionsButton = screen.getByTestId('updateOptions');

      expect(getRenderCount()).toBe(1); // hook mount

      await waitFor(() => expect(uninitializedControl).toHaveTextContent('true'));
      await waitFor(() => expect(data).toBeUndefined());

      fireEvent.click(fetchButton);
      expect(getRenderCount()).toBe(2);

      await waitFor(() => expect(fetchingControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchingControl).toHaveTextContent('false'));
      expect(getRenderCount()).toBe(3);

      fireEvent.click(updateOptionsButton); // setState = 1
      expect(getRenderCount()).toBe(4);

      fireEvent.click(screen.getByTestId('fetchButton')); // perform new request = 2
      await waitFor(() => expect(fetchingControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchingControl).toHaveTextContent('false'));
      expect(getRenderCount()).toBe(6);

      fireEvent.click(screen.getByTestId('updateOptions')); // setState = 1
      expect(getRenderCount()).toBe(7);

      fireEvent.click(screen.getByTestId('fetchButton'));
      await waitFor(() => expect(fetchingControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchingControl).toHaveTextContent('false'));
      expect(getRenderCount()).toBe(9);

      expect(getState().actions.filter(api.internalActions.updateSubscriptionOptions.match)).toHaveLength(1);
    });

    test('useLazyQuery accepts updated args and unsubscribes the original query', async () => {
      const { fixture } = await render(HooksComponents.LazyFetchingMultiComponent, { imports: storeRef.imports });
      data = fixture.componentInstance.data;

      const uninitializedControl = screen.getByTestId('isUninitialized');
      const fetchingControl = screen.getByTestId('isFetching');
      const fetchUser1Button = screen.getByTestId('fetchUser1');
      const fetchUser2Button = screen.getByTestId('fetchUser2');

      await waitFor(() => expect(uninitializedControl).toHaveTextContent('true'));
      await waitFor(() => expect(data).toBeUndefined());

      fireEvent.click(fetchUser1Button);

      await waitFor(() => expect(fetchingControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchingControl).toHaveTextContent('false'));

      // Being that there is only the initial query, no unsubscribe should be dispatched
      expect(getState().actions.filter(api.internalActions.unsubscribeQueryResult.match)).toHaveLength(0);

      fireEvent.click(fetchUser2Button);

      await waitFor(() => expect(fetchingControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchingControl).toHaveTextContent('false'));

      expect(getState().actions.filter(api.internalActions.unsubscribeQueryResult.match)).toHaveLength(1);

      fireEvent.click(fetchUser1Button);

      expect(getState().actions.filter(api.internalActions.unsubscribeQueryResult.match)).toHaveLength(2);

      // we always unsubscribe the original promise and create a new one
      fireEvent.click(fetchUser1Button);
      expect(getState().actions.filter(api.internalActions.unsubscribeQueryResult.match)).toHaveLength(3);

      fixture.destroy();

      // We unsubscribe after the component unmounts
      expect(getState().actions.filter(api.internalActions.unsubscribeQueryResult.match)).toHaveLength(4);
    });

    test('useLazyQuery hook callback returns various properties to handle the result', async () => {
      await render(HooksComponents.LazyFetchingCallbackComponent, { imports: storeRef.imports });

      expect(screen.queryByText(/An error has occurred/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Successfully fetched user/i)).not.toBeInTheDocument();
      expect(screen.queryByText('Request was aborted')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Fetch User and abort' }));
      await screen.findByText('An error has occurred fetching userId: 1');
      expect(screen.queryByText(/Successfully fetched user/i)).not.toBeInTheDocument();
      screen.getByText('Request was aborted');

      fireEvent.click(screen.getByRole('button', { name: 'Fetch User successfully' }));
      await screen.findByText('Successfully fetched user Timmy');
      expect(screen.queryByText(/An error has occurred/i)).not.toBeInTheDocument();
      expect(screen.queryByText('Request was aborted')).not.toBeInTheDocument();
    });

    // eslint-disable-next-line max-len
    test('unwrapping the useLazyQuery trigger result does not throw on ConditionError and instead returns the aggregate error', async () => {
      await render(HooksComponents.LazyFetchingCbAdvComponent, { imports: storeRef.imports });

      const fetchButton = screen.getByRole('button', { name: 'Fetch User' });
      fireEvent.click(fetchButton);
      fireEvent.click(fetchButton); /* This technically dispatches a ConditionError,
      but we don't want to see that here. We want the real error to resolve. */

      await waitFor(() => {
        const errorResult = screen.getByTestId('error')?.textContent || '';
        const unwrappedErrorResult = screen.getByTestId('unwrappedError')?.textContent || '';

        expect(JSON.parse(errorResult)).toMatchObject({ status: 500, data: null });
        // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
        expect(JSON.parse(unwrappedErrorResult)).toMatchObject(JSON.parse(errorResult));
      });

      expect(screen.getByTestId('result')).toHaveTextContent('');
    });

    test('useLazyQuery does not throw on ConditionError and instead returns the aggregate result', async () => {
      await render(HooksComponents.LazyFetchingCbUserAdvComponent, { imports: storeRef.imports });

      const fetchButton = screen.getByRole('button', { name: 'Fetch User' });
      fireEvent.click(fetchButton);
      fireEvent.click(fetchButton); /* This technically dispatches a ConditionError, but we don't want to see that here.
      We want the real result to resolve and ignore the error. */

      await waitFor(() => {
        const dataResult = screen.getByTestId('result')?.textContent || '';
        const unwrappedDataResult = screen.getByTestId('unwrappedResult')?.textContent || '';

        expect(JSON.parse(dataResult)).toMatchObject({ name: 'Timmy' });
        // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
        expect(JSON.parse(unwrappedDataResult)).toMatchObject(JSON.parse(dataResult));
      });

      expect(screen.getByTestId('error')).toHaveTextContent('');
    });
  });

  describe('useMutation', () => {
    test('useMutation hook sets and unsets the isLoading flag when running', async () => {
      await render(HooksComponents.MutationComponent, { imports: storeRef.imports });

      const loadingControl = screen.getByTestId('isLoading');
      const updateControl = screen.getByRole('button', { name: /Update User/i });

      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));
      fireEvent.click(updateControl);
      await waitFor(() => expect(loadingControl).toHaveTextContent('true'));
      await waitFor(() => expect(loadingControl).toHaveTextContent('false'));
    });

    test('useMutation hook sets data to the resolved response on success', async () => {
      const result = { name: 'Banana' };

      await render(HooksComponents.MutationComponent, { imports: storeRef.imports });

      const resultControl = screen.getByTestId('result');
      const updateControl = screen.getByRole('button', { name: /Update User/i });

      fireEvent.click(updateControl);
      await waitFor(() => expect(resultControl).toHaveTextContent(JSON.stringify(result)));
    });

    test('useMutation hook callback returns various properties to handle the result', async () => {
      await render(HooksComponents.MutationAbortComponent, { imports: storeRef.imports });

      expect(screen.queryByText(/An error has occurred/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Successfully updated user/i)).not.toBeInTheDocument();
      expect(screen.queryByText('Request was aborted')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Update User and abort' }));
      await screen.findByText('An error has occurred updating user Banana');
      expect(screen.queryByText(/Successfully updated user/i)).not.toBeInTheDocument();
      screen.getByText('Request was aborted');
    });

    test('useMutation return value contains originalArgs', async () => {
      await render(HooksComponents.MutationOriginalArgsComponent, {
        imports: storeRef.imports,
      });

      const arg = { name: 'Foo' };

      const updateButton = screen.getByTestId('updateButton');
      const originalArgs = screen.getByTestId('originalArgs');

      expect(originalArgs).toHaveTextContent('');

      fireEvent.click(updateButton);
      expect(originalArgs).toHaveTextContent(JSON.stringify(arg));
    });

    test('`reset` sets state back to original state', async () => {
      await render(HooksComponents.MutationResetComponent, {
        imports: storeRef.imports,
      });

      await screen.findByText(/isUninitialized/i);
      expect(screen.queryByText('Yay')).not.toBeInTheDocument();

      expect(Object.keys(getState().api.mutations)).toHaveLength(0);

      userEvent.click(screen.getByRole('button', { name: 'trigger' }));

      await screen.findByText(/isSuccess/i);
      expect(screen.getByText('Yay')).toBeInTheDocument();

      expect(Object.keys(getState().api.mutations)).toHaveLength(1);

      userEvent.click(screen.getByRole('button', { name: 'reset' }));

      await screen.findByText(/isUninitialized/i);
      expect(screen.queryByText('Yay')).not.toBeInTheDocument();

      expect(Object.keys(getState().api.mutations)).toHaveLength(0);
    });
  });

  describe('usePrefetch', () => {
    test('usePrefetch respects force arg', async () => {
      await render(HooksComponents.PrefetchHighPriorityComponent, { imports: storeRef.imports });

      const fetchControl = screen.getByTestId('isFetching');
      const prefetchControl = screen.getByTestId('highPriority');

      // Resolve initial query
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

      fireEvent.mouseEnter(prefetchControl);
      expect(api.endpoints.getUser.select(HooksComponents.HIGH_PRIORITY_USER_ID)(getState())).toEqual({
        data: { name: 'Timmy' },
        endpointName: 'getUser',
        error: undefined,
        fulfilledTimeStamp: expect.any(Number),
        isError: false,
        isLoading: true,
        isSuccess: false,
        isUninitialized: false,
        originalArgs: HooksComponents.HIGH_PRIORITY_USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: QueryStatus.pending,
      });

      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

      expect(api.endpoints.getUser.select(HooksComponents.HIGH_PRIORITY_USER_ID)(getState())).toEqual({
        data: { name: 'Timmy' },
        endpointName: 'getUser',
        fulfilledTimeStamp: expect.any(Number),
        isError: false,
        isLoading: false,
        isSuccess: true,
        isUninitialized: false,
        originalArgs: HooksComponents.HIGH_PRIORITY_USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: QueryStatus.fulfilled,
      });
    });

    test('usePrefetch does not make an additional request if already in the cache and force=false', async () => {
      await render(HooksComponents.PrefetchLowPriorityComponent, { imports: storeRef.imports });

      const fetchControl = screen.getByTestId('isFetching');
      const prefetchControl = screen.getByTestId('lowPriority');

      /// Let the initial query resolve
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

      // Try to prefetch what we just loaded
      fireEvent.mouseEnter(prefetchControl);
      expect(api.endpoints.getUser.select(HooksComponents.LOW_PRIORITY_USER_ID)(getState())).toEqual({
        data: { name: 'Timmy' },
        endpointName: 'getUser',
        fulfilledTimeStamp: expect.any(Number),
        isError: false,
        isLoading: false,
        isSuccess: true,
        isUninitialized: false,
        originalArgs: HooksComponents.LOW_PRIORITY_USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: QueryStatus.fulfilled,
      });

      await waitMs();

      expect(api.endpoints.getUser.select(HooksComponents.LOW_PRIORITY_USER_ID)(getState())).toEqual({
        data: { name: 'Timmy' },
        endpointName: 'getUser',
        fulfilledTimeStamp: expect.any(Number),
        isError: false,
        isLoading: false,
        isSuccess: true,
        isUninitialized: false,
        originalArgs: HooksComponents.LOW_PRIORITY_USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: QueryStatus.fulfilled,
      });
    });

    test('usePrefetch respects ifOlderThan when it evaluates to true', async () => {
      await render(HooksComponents.PrefetchLowPriorityComponent, {
        imports: storeRef.imports,
        componentProperties: {
          prefetchUser: () => api.usePrefetch('getUser', { ifOlderThan: 0.2 })(HooksComponents.LOW_PRIORITY_USER_ID),
        },
      });

      const fetchControl = screen.getByTestId('isFetching');
      const prefetchControl = screen.getByTestId('lowPriority');

      // Resolve initial query
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

      // Wait 400ms, making it respect ifOlderThan
      await waitMs(400);

      // This should run the query being that we're past the threshold
      fireEvent.mouseEnter(prefetchControl);
      expect(api.endpoints.getUser.select(HooksComponents.LOW_PRIORITY_USER_ID)(getState())).toEqual({
        data: { name: 'Timmy' },
        endpointName: 'getUser',
        fulfilledTimeStamp: expect.any(Number),
        isError: false,
        isLoading: true,
        isSuccess: false,
        isUninitialized: false,
        originalArgs: HooksComponents.LOW_PRIORITY_USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: QueryStatus.pending,
      });

      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

      expect(api.endpoints.getUser.select(HooksComponents.LOW_PRIORITY_USER_ID)(getState())).toEqual({
        data: { name: 'Timmy' },
        endpointName: 'getUser',
        fulfilledTimeStamp: expect.any(Number),
        isError: false,
        isLoading: false,
        isSuccess: true,
        isUninitialized: false,
        originalArgs: HooksComponents.LOW_PRIORITY_USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: QueryStatus.fulfilled,
      });
    });

    test('usePrefetch returns the last success result when ifOlderThan evalutes to false', async () => {
      await render(HooksComponents.PrefetchLowPriorityComponent, {
        imports: storeRef.imports,
        componentProperties: {
          prefetchUser: () => api.usePrefetch('getUser', { ifOlderThan: 10 })(HooksComponents.LOW_PRIORITY_USER_ID),
        },
      });

      const fetchControl = screen.getByTestId('isFetching');
      const prefetchControl = screen.getByTestId('lowPriority');

      // Resolve initial query
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
      await waitMs();

      // Get a snapshot of the last result
      const latestQueryData = api.endpoints.getUser.select(HooksComponents.LOW_PRIORITY_USER_ID)(getState());

      fireEvent.mouseEnter(prefetchControl);
      //  Serve up the result from the cache being that the condition wasn't met
      expect(api.endpoints.getUser.select(HooksComponents.LOW_PRIORITY_USER_ID)(getState())).toEqual(latestQueryData);
    });

    test('usePrefetch executes a query even if conditions fail when the cache is empty', async () => {
      await render(HooksComponents.PrefetchUncachedComponent, { imports: storeRef.imports });

      const prefetchControl = screen.getByTestId('lowPriority');

      fireEvent.mouseEnter(prefetchControl);

      expect(api.endpoints.getUser.select(HooksComponents.LOW_PRIORITY_USER_ID)(getState())).toEqual({
        endpointName: 'getUser',
        isError: false,
        isLoading: true,
        isSuccess: false,
        isUninitialized: false,
        originalArgs: HooksComponents.LOW_PRIORITY_USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: 'pending',
      });
      await waitFor(() =>
        expect(api.endpoints.getUser.select(HooksComponents.LOW_PRIORITY_USER_ID)(getState()).isSuccess).toBeTruthy(),
      );
    });
  });
});

describe.skip('useQuery and useMutation invalidation behavior', () => {
  const invalidationsStoreRef = setupApiStore(invalidationsApi, { ...actionsReducer(invalidationsApi.reducerPath) });

  // eslint-disable-next-line max-len
  test('initially failed useQueries that provide an tag will refetch after a mutation invalidates it', async () => {
    const checkSessionData = { name: 'matt' };
    server.use(
      rest.get('https://example.com/me', (_, res, ctx) => res.once(ctx.status(500))),
      rest.get('https://example.com/me', (_, res, ctx) => res(ctx.json(checkSessionData))),
      rest.post('https://example.com/login', (_, res, ctx) => res(ctx.status(200))),
    );

    await render(HooksComponents.InvalidationsComponent, { imports: invalidationsStoreRef.imports });

    const isLoading = screen.getByTestId('isLoading');
    const isError = screen.getByTestId('isError');
    const user = screen.getByTestId('user');
    const loginLoading = screen.getByTestId('loginLoading');

    await waitFor(() => expect(isLoading).toHaveTextContent('true'));
    await waitFor(() => expect(isLoading).toHaveTextContent('false'));
    await waitFor(() => expect(isError).toHaveTextContent('true'));
    await waitFor(() => expect(user).toHaveTextContent(''));

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => expect(loginLoading).toHaveTextContent('true'));
    await waitFor(() => expect(loginLoading).toHaveTextContent('false'));
    // login mutation will cause the original errored out query to refire, clearing the error and setting the user
    await waitFor(() => expect(isError).toHaveTextContent('false'));
    await waitFor(() => expect(user).toHaveTextContent(JSON.stringify(checkSessionData)));

    const { checkSession, login } = invalidationsApi.endpoints;
    expect(getState().actions).toMatchSequence(
      invalidationsApi.internalActions.middlewareRegistered.match,
      checkSession.matchPending,
      invalidationsApi.internalActions.subscriptionsUpdated.match,
      checkSession.matchRejected,
      login.matchPending,
      login.matchFulfilled,
      checkSession.matchPending,
      checkSession.matchFulfilled,
    );
  });
});

describe.skip('hooks with createApi defaults set', () => {
  const defaultStoreRef = setupApiStore(defaultApi);

  beforeEach(() => {
    resetAmount();
  });

  test('useQuery hook respects refetchOnMountOrArgChange: true when set in createApi options', async () => {
    const { rerender } = await render(HooksComponents.RefetchOnMountDefaultsComponent, {
      imports: defaultStoreRef.imports,
    });

    const fetchControl = screen.getByTestId('isFetching');
    const loadingControl = screen.getByTestId('isLoading');
    const amount = screen.getByTestId('amount');

    await waitFor(() => expect(loadingControl).toHaveTextContent('true'));
    await waitFor(() => expect(loadingControl).toHaveTextContent('false'));

    await waitFor(() => expect(amount).toHaveTextContent('1'));

    rerender({
      componentProperties: {
        query$: defaultApi.endpoints.getIncrementedAmount.useQuery(),
      },
    });

    // Let's make sure we actually fetch, and we increment
    await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
    await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

    await waitFor(() => expect(amount).toHaveTextContent('2'));
  });

  test('useQuery hook overrides default refetchOnMountOrArgChange: false that was set by createApi', async () => {
    const { rerender } = await render(HooksComponents.RefetchOnMountDefaultsComponent, {
      imports: defaultStoreRef.imports,
    });

    const fetchControl = screen.getByTestId('isFetching');
    const loadingControl = screen.getByTestId('isLoading');
    const amount = screen.getByTestId('amount');

    await waitFor(() => expect(loadingControl).toHaveTextContent('true'));
    await waitFor(() => expect(loadingControl).toHaveTextContent('false'));

    await waitFor(() => expect(amount).toHaveTextContent('1'));

    rerender({
      componentProperties: {
        query$: defaultApi.endpoints.getIncrementedAmount.useQuery(undefined, {
          refetchOnMountOrArgChange: false,
        }),
      },
    });

    await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
    await waitFor(() => expect(amount).toHaveTextContent('1'));
  });
});

describe.skip('selectFromResult (query) behaviors', () => {
  const postStoreRef = setupApiStore(libPostsApi, { ...actionsReducer(libPostsApi.reducerPath) });

  let getRenderCount: () => number = () => 0;

  beforeEach(() => {
    resetPostsApi();
  });

  expectExactType(libPostsApi.useGetPostsQuery)(libPostsApi.endpoints.getPosts.useQuery);
  expectExactType(libPostsApi.useUpdatePostMutation)(libPostsApi.endpoints.updatePost.useMutation);
  expectExactType(libPostsApi.useAddPostMutation)(libPostsApi.endpoints.addPost.useMutation);

  test('useQueryState serves a deeply memoized value and does not change unnecessarily', async () => {
    const { fixture } = await render(HooksComponents.PostsContainerComponent, {
      declarations: [HooksComponents.PostComponent, HooksComponents.SelectedPostComponent],
      imports: postStoreRef.imports,
    });
    getRenderCount = fixture.componentInstance.selectedPost.renderCounter.getRenderCount;

    const addPost = screen.getByTestId('addPost');

    expect(getRenderCount()).toBe(1);

    await waitFor(() => expect(getRenderCount()).toBe(2));

    fireEvent.click(addPost);
    await waitFor(() => expect(getRenderCount()).toBe(2));
    // We fire off a few requests that would typically cause a change as JSON.parse()
    // on a request would always be a new object.
    fireEvent.click(addPost);
    fireEvent.click(addPost);
    await waitFor(() => expect(getRenderCount()).toBe(2));
    // Being that it didn't change, we can be assured that the behavior is correct
  });

  /**
   * This test shows that even though a user can select a specific post, the fetching/loading flags
   * will still cause changes for the query. This should show that if you're using selectFromResult,
   * the 'performance' value comes with selecting _only_ the data.
   */
  //eslint-disable-next-line
  test('useQuery with selectFromResult with all flags destructured rerenders like the default useQuery behavior', async () => {
    const { fixture } = await render(HooksComponents.PostsHookContainerAllFlagsComponent, {
      declarations: [HooksComponents.PostComponent, HooksComponents.SelectedPostAllFlagsHookComponent],
      imports: postStoreRef.imports,
    });
    getRenderCount = fixture.componentInstance.selectedPost.renderCounter.getRenderCount;

    const addPost = screen.getByTestId('addPost');

    expect(getRenderCount()).toBe(1);

    await waitFor(() => expect(getRenderCount()).toBe(2));

    fireEvent.click(addPost);
    await waitFor(() => expect(getRenderCount()).toBe(3));

    fireEvent.click(addPost);
    fireEvent.click(addPost);
    await waitFor(() => expect(getRenderCount()).toBe(3));
  });

  // eslint-disable-next-line
  test('useQuery with selectFromResult option serves a deeply memoized value and does not change unnecessarily', async () => {
    const { fixture } = await render(HooksComponents.PostsHookContainerComponent, {
      declarations: [HooksComponents.PostComponent, HooksComponents.SelectedPostHookComponent],
      imports: postStoreRef.imports,
    });
    getRenderCount = fixture.componentInstance.selectedPost.renderCounter.getRenderCount;

    const addPost = screen.getByTestId('addPost');

    expect(getRenderCount()).toBe(1);

    await waitFor(() => expect(getRenderCount()).toBe(2));

    fireEvent.click(addPost);
    await waitFor(() => expect(getRenderCount()).toBe(2));
    fireEvent.click(addPost);
    fireEvent.click(addPost);
    await waitFor(() => expect(getRenderCount()).toBe(2));
  });

  // eslint-disable-next-line max-len
  test('useQuery with selectFromResult option serves a deeply memoized value, then ONLY updates when the underlying data changes', async () => {
    const { fixture } = await render(HooksComponents.PostsHookContainerComponent, {
      declarations: [HooksComponents.PostComponent, HooksComponents.SelectedPostHookComponent],
      imports: postStoreRef.imports,
    });
    getRenderCount = fixture.componentInstance.selectedPost.renderCounter.getRenderCount;

    const addPost = screen.getByTestId('addPost');
    const updatePost = screen.getByTestId('updatePost');

    expect(getRenderCount()).toBe(1);

    fireEvent.click(addPost);
    await waitFor(() => expect(getRenderCount()).toBe(2));
    fireEvent.click(addPost);
    fireEvent.click(addPost);
    await waitFor(() => expect(getRenderCount()).toBe(2));

    fireEvent.click(updatePost);
    await waitFor(() => expect(getRenderCount()).toBe(3));
    await screen.findByText(/supercoooll!/i);

    fireEvent.click(addPost);
    await waitFor(() => expect(getRenderCount()).toBe(3));
  });

  test('useQuery with selectFromResult option has a type error if the result is not an object', async () => {
    await render(HooksComponents.NoObjectQueryComponent, { imports: postStoreRef.imports });

    expect(screen.getByTestId('size2')).toHaveTextContent('0');
  });
});

describe.skip('selectFromResult (mutation) behavior', () => {
  const mutationStoreRef = setupApiStore(mutationApi, { ...actionsReducer(mutationApi.reducerPath) });

  let getRenderCount: () => number = () => 0;

  beforeEach(() => {
    resetAmount();
  });

  test('causes no more than one rerender when using selectFromResult with an empty object', async () => {
    const { fixture } = await render(HooksComponents.MutationSelectComponent, {
      imports: mutationStoreRef.imports,
    });
    getRenderCount = fixture.componentInstance.renderCounter.getRenderCount;

    const incrementButton = screen.getByTestId('incrementButton');

    expect(getRenderCount()).toBe(1);

    fireEvent.click(incrementButton);
    await waitMs(400); // give our baseQuery a chance to return
    expect(getRenderCount()).toBe(2);

    fireEvent.click(incrementButton);
    await waitMs(400);
    expect(getRenderCount()).toBe(3);

    const { increment } = mutationApi.endpoints;

    expect(getState().actions).toMatchSequence(
      mutationApi.internalActions.middlewareRegistered.match,
      increment.matchPending,
      increment.matchFulfilled,
      increment.matchPending,
      mutationApi.internalActions.removeMutationResult.match,
      increment.matchFulfilled,
    );
  });

  test('causes rerenders when only selected data changes', async () => {
    const { fixture } = await render(HooksComponents.MutationSelectDataComponent, {
      imports: mutationStoreRef.imports,
    });
    getRenderCount = fixture.componentInstance.renderCounter.getRenderCount;

    const incrementButton = screen.getByTestId('incrementButton');
    const data = screen.getByTestId('data');

    expect(getRenderCount()).toBe(1);

    fireEvent.click(incrementButton);
    await waitFor(() => expect(data).toHaveTextContent(JSON.stringify({ amount: 1 })));
    expect(getRenderCount()).toBe(3);

    fireEvent.click(incrementButton);
    await waitFor(() => expect(data).toHaveTextContent(JSON.stringify({ amount: 2 })));
    expect(getRenderCount()).toBe(5);
  });

  test('causes the expected # of rerenders when NOT using selectFromResult', async () => {
    const { fixture } = await render(HooksComponents.MutationSelectDefaultComponent, {
      imports: mutationStoreRef.imports,
    });
    getRenderCount = fixture.componentInstance.renderCounter.getRenderCount;

    const incrementButton = screen.getByTestId('incrementButton');
    const status = screen.getByTestId('status');

    expect(getRenderCount()).toBe(1); // mount, uninitialized status in substate

    fireEvent.click(incrementButton);
    expect(getRenderCount()).toBe(2); // will be pending, isLoading: true,
    await waitFor(() => expect(status).toHaveTextContent('pending'));
    await waitFor(() => expect(status).toHaveTextContent('fulfilled'));
    expect(getRenderCount()).toBe(3);

    fireEvent.click(incrementButton);
    await waitFor(() => expect(status).toHaveTextContent('pending'));
    await waitFor(() => expect(status).toHaveTextContent('fulfilled'));
    expect(getRenderCount()).toBe(5);
  });

  test('useMutation with selectFromResult option has a type error if the result is not an object', async () => {
    await render(HooksComponents.NoObjectMutationComponent, { imports: mutationStoreRef.imports });

    expect(screen.getByTestId('incrementButton')).toBeInTheDocument();
  });
});

describe.skip('skip behaviour', () => {
  const storeRef = setupApiStore(api, { ...actionsReducer(api.reducerPath) });

  const uninitialized = {
    status: QueryStatus.uninitialized,
    refetch: expect.any(Function),
    data: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    isSuccess: false,
    isUninitialized: true,
  };

  function subscriptionCount(key: string) {
    return Object.keys(getState().api.subscriptions[key] || {}).length;
  }

  test('normal skip', async () => {
    let current: any;
    const { rerender } = await render(HooksComponents.SkipComponent, {
      imports: storeRef.imports,
      componentProperties: {
        query$: api.endpoints.getUser.useQuery(1, { skip: true }).pipe(tap((value) => (current = value))),
      },
    });

    expect(current).toEqual(uninitialized);
    expect(subscriptionCount('getUser(1)')).toBe(0);

    rerender({
      componentProperties: {
        query$: api.endpoints.getUser.useQuery(1).pipe(tap((value) => (current = value))),
      },
    });
    expect(current).toMatchObject({ status: QueryStatus.pending });
    expect(subscriptionCount('getUser(1)')).toBe(0);

    rerender({
      componentProperties: {
        query$: api.endpoints.getUser.useQuery(1, { skip: true }).pipe(tap((value) => (current = value))),
      },
    });
    expect(current).toEqual(uninitialized);
    expect(subscriptionCount('getUser(1)')).toBe(0);
  });

  test('skipToken', async () => {
    let current: any;
    const { rerender } = await render(HooksComponents.SkipComponent, {
      imports: storeRef.imports,
      componentProperties: {
        query$: api.endpoints.getUser.useQuery(skipToken).pipe(tap((value) => (current = value))),
      },
    });

    expect(current).toEqual(uninitialized);
    expect(subscriptionCount('getUser(1)')).toBe(0);
    // also no subscription on `getUser(skipToken)` or similar:
    expect(getState().api.subscriptions).toEqual({});

    rerender({
      componentProperties: {
        query$: api.endpoints.getUser.useQuery(1).pipe(tap((value) => (current = value))),
      },
    });
    expect(current).toMatchObject({ status: QueryStatus.pending });
    expect(subscriptionCount('getUser(1)')).toBe(0);
    // expect(getState().api.subscriptions).not.toEqual({});

    rerender({
      componentProperties: {
        query$: api.endpoints.getUser.useQuery(skipToken).pipe(tap((value) => (current = value))),
      },
    });
    expect(current).toEqual(uninitialized);
    expect(subscriptionCount('getUser(1)')).toBe(0);
  });
});
