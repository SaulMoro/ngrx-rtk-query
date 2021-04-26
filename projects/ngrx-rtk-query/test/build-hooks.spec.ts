import { fireEvent, render, waitFor, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { QueryStatus } from '@reduxjs/toolkit/query';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { rest } from 'msw';

import { getState } from '../src/lib/thunk.service';
import { resetPostsApi } from './mocks/lib-posts.handlers';
import { server } from './mocks/server';
import * as HooksComponents from './helper-components';
import { actionsReducer, expectExactType, matchSequence, setupApiStore, waitMs } from './helper';
import { api, defaultApi, invalidationsApi, libPostsApi, mutationApi, resetAmount } from './helper-apis';

describe('hooks tests', () => {
  const storeRef = setupApiStore(api, { ...actionsReducer });

  beforeEach(() => {
    resetAmount();
  });

  describe('useQuery', () => {
    let getRenderCount: () => number = () => 0;

    test('useQuery hook basic render count assumptions', async () => {
      const { fixture } = await render(HooksComponents.FetchingBaseComponent, { imports: storeRef.imports });
      getRenderCount = fixture.componentInstance.renderCounter.getRenderCount;

      const fetchControl = screen.getByTestId('isFetching');

      // By the time this runs, the initial render will happen, and the query will start immediately running by the time
      expect(getRenderCount()).toBe(1);
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
      expect(getRenderCount()).toBe(2);
    });

    test('useQuery hook sets isFetching=true whenever a request is in flight', async () => {
      const { fixture } = await render(HooksComponents.FetchingComponent, { imports: storeRef.imports });
      getRenderCount = fixture.componentInstance.renderCounter.getRenderCount;

      const fetchControl = screen.getByTestId('isFetching');
      const incrementControl = screen.getByRole('button', { name: /Increment value/i });

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
      // We call a refetch, should set to true
      fireEvent.click(refetchControl);
      await waitFor(() => expect(loadingControl).toHaveTextContent('true'));
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
      await waitFor(() => {
        expect(loadingControl).toHaveTextContent('true');
        expect(fetchControl).toHaveTextContent('true');
      });

      // Make sure the request is done for sure.
      await waitFor(() => {
        expect(loadingControl).toHaveTextContent('false');
        expect(fetchControl).toHaveTextContent('false');
      });
      expect(getRenderCount()).toBe(3);

      fireEvent.click(incrementControl);
      // Being that we already have data and changing the value doesn't trigger a new request,
      // only the button click should impact the render
      await waitFor(() => {
        expect(loadingControl).toHaveTextContent('false');
        expect(fetchControl).toHaveTextContent('false');
      });
      expect(getRenderCount()).toBe(4);

      // We call a refetch, should set both to true, then false when complete/errored
      fireEvent.click(refetchControl);
      await waitFor(() => {
        expect(loadingControl).toHaveTextContent('true');
        expect(fetchControl).toHaveTextContent('true');
      });
      await waitFor(() => {
        expect(loadingControl).toHaveTextContent('false');
        expect(fetchControl).toHaveTextContent('false');
      });
      expect(getRenderCount()).toBe(6);
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
        query$: api.endpoints.getIncrementedAmount.useQuery(undefined, {
          refetchOnMountOrArgChange: true,
        }),
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
        query$: api.endpoints.getIncrementedAmount.useQuery(undefined, {
          refetchOnMountOrArgChange: 10,
        }),
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
        query$: api.endpoints.getIncrementedAmount.useQuery(undefined, {
          refetchOnMountOrArgChange: 0.5,
        }),
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

      // skipped queries do nothing by default, so we need to toggle that to get a cached result
      fireEvent.click(skipControl);

      await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
      await waitFor(() => expect(amount).toHaveTextContent('1'));

      // This will pull from the cache as the time criteria is not met.
      await waitMs(100);
      let skip = new BehaviorSubject<boolean>(true);
      let skip$ = skip.asObservable();

      rerender({
        skip,
        skip$,
        query$: api.endpoints.getIncrementedAmount.useQuery(
          undefined,
          skip$.pipe(map((currentSkip) => ({ refetchOnMountOrArgChange: 0.5, skip: currentSkip }))),
        ),
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
        skip,
        skip$,
        query$: api.endpoints.getIncrementedAmount.useQuery(
          undefined,
          skip$.pipe(map((currentSkip) => ({ refetchOnMountOrArgChange: 0.5, skip: currentSkip }))),
        ),
      });

      // toggle skip -> true... will cause a refetch as the time criteria is now satisfied
      fireEvent.click(skipControl);

      await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

      await waitFor(() => expect(amount).toHaveTextContent('2'));
    });
  });

  describe('useLazyQuery', () => {
    let getRenderCount: () => number = () => 0;
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
  });

  describe('usePrefetch', () => {
    test('usePrefetch respects force arg', async () => {
      await render(HooksComponents.PrefetchHighPriorityComponent, { imports: storeRef.imports });

      const fetchControl = screen.getByTestId('isFetching');
      const prefetchControl = screen.getByTestId('highPriority');

      // Resolve initial query
      await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

      userEvent.hover(prefetchControl);
      expect(api.endpoints.getUser.select(HooksComponents.HIGH_PRIORITY_USER_ID)(getState())).toEqual({
        data: undefined,
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
        data: undefined,
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
      userEvent.hover(prefetchControl);
      expect(api.endpoints.getUser.select(HooksComponents.LOW_PRIORITY_USER_ID)(getState())).toEqual({
        data: undefined,
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
        data: undefined,
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
      userEvent.hover(prefetchControl);
      expect(api.endpoints.getUser.select(HooksComponents.LOW_PRIORITY_USER_ID)(getState())).toEqual({
        data: undefined,
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
        data: undefined,
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

      userEvent.hover(prefetchControl);
      //  Serve up the result from the cache being that the condition wasn't met
      expect(api.endpoints.getUser.select(HooksComponents.LOW_PRIORITY_USER_ID)(getState())).toEqual(latestQueryData);
    });

    test('usePrefetch executes a query even if conditions fail when the cache is empty', async () => {
      await render(HooksComponents.PrefetchUncachedComponent, { imports: storeRef.imports });

      const prefetchControl = screen.getByTestId('lowPriority');

      userEvent.hover(prefetchControl);

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

describe('useQuery and useMutation invalidation behavior', () => {
  const invalidationsStoreRef = setupApiStore(invalidationsApi, { ...actionsReducer });

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
    const completeSequence = [
      checkSession.matchPending,
      checkSession.matchRejected,
      login.matchPending,
      login.matchFulfilled,
      checkSession.matchPending,
      checkSession.matchFulfilled,
    ];

    matchSequence(getState().actions, ...completeSequence);
  });
});

describe('hooks with createApi defaults set', () => {
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
      query$: defaultApi.endpoints.getIncrementedAmount.useQuery(),
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
      query$: defaultApi.endpoints.getIncrementedAmount.useQuery(undefined, {
        refetchOnMountOrArgChange: false,
      }),
    });

    await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
    await waitFor(() => expect(amount).toHaveTextContent('1'));
  });
});

describe('selectFromResult (query) behaviors', () => {
  const postStoreRef = setupApiStore(libPostsApi);

  beforeEach(() => {
    resetPostsApi();
  });

  expectExactType(libPostsApi.useGetPostsQuery)(libPostsApi.endpoints.getPosts.useQuery);
  expectExactType(libPostsApi.useUpdatePostMutation)(libPostsApi.endpoints.updatePost.useMutation);
  expectExactType(libPostsApi.useAddPostMutation)(libPostsApi.endpoints.addPost.useMutation);

  test('useQueryState serves a deeply memoized value and does not rerender unnecessarily', async () => {
    await render(HooksComponents.PostsContainerComponent, {
      declarations: [HooksComponents.PostComponent, HooksComponents.SelectedPostComponent],
      imports: postStoreRef.imports,
    });

    const renderCount = screen.getByTestId('renderCount');
    const addPost = screen.getByTestId('addPost');

    expect(renderCount).toHaveTextContent('1');

    await waitFor(() => expect(renderCount).toHaveTextContent('2'));

    fireEvent.click(addPost);
    await waitFor(() => expect(renderCount).toHaveTextContent('2'));
    // We fire off a few requests that would typically cause a rerender as JSON.parse()
    // on a request would always be a new object.
    fireEvent.click(addPost);
    fireEvent.click(addPost);
    await waitFor(() => expect(renderCount).toHaveTextContent('2'));
    // Being that it didn't rerender, we can be assured that the behavior is correct
  });

  // eslint-disable-next-line max-len
  test('useQuery with selectFromResult option serves a deeply memoized value and does not rerender unnecessarily', async () => {
    await render(HooksComponents.PostsHookContainerComponent, {
      declarations: [HooksComponents.PostComponent, HooksComponents.SelectedPostHookComponent],
      imports: postStoreRef.imports,
    });

    const renderCount = screen.getByTestId('renderCount');
    const addPost = screen.getByTestId('addPost');

    expect(renderCount).toHaveTextContent('1');

    await waitFor(() => expect(renderCount).toHaveTextContent('2'));

    fireEvent.click(addPost);
    await waitFor(() => expect(renderCount).toHaveTextContent('2'));
    fireEvent.click(addPost);
    fireEvent.click(addPost);
    await waitFor(() => expect(renderCount).toHaveTextContent('2'));
  });

  // eslint-disable-next-line max-len
  test('useQuery with selectFromResult option serves a deeply memoized value, then ONLY updates when the underlying data changes', async () => {
    await render(HooksComponents.PostsHookContainerComponent, {
      declarations: [HooksComponents.PostComponent, HooksComponents.SelectedPostHookComponent],
      imports: postStoreRef.imports,
    });

    const renderCount = screen.getByTestId('renderCount');
    const addPost = screen.getByTestId('addPost');
    const updatePost = screen.getByTestId('updatePost');

    expect(renderCount).toHaveTextContent('1');

    fireEvent.click(addPost);
    await waitFor(() => expect(renderCount).toHaveTextContent('2'));
    fireEvent.click(addPost);
    fireEvent.click(addPost);
    await waitFor(() => expect(renderCount).toHaveTextContent('2'));

    fireEvent.click(updatePost);
    await waitFor(() => expect(renderCount).toHaveTextContent('3'));
    await screen.findByText(/supercoooll!/i);

    fireEvent.click(addPost);
    await waitFor(() => expect(renderCount).toHaveTextContent('3'));
  });

  test('useQuery with selectFromResult option has a type error if the result is not an object', async () => {
    await render(HooksComponents.NoObjectQueryComponent, { imports: postStoreRef.imports });

    expect(screen.getByTestId('size2')).toHaveTextContent('0');
  });
});

describe('selectFromResult (mutation) behavior', () => {
  const mutationStoreRef = setupApiStore(mutationApi, { ...actionsReducer });

  let getRenderCount: () => number = () => 0;

  beforeEach(() => {
    resetAmount();
  });

  test('causes no more than one rerender when using selectFromResult with an empty object', async () => {
    const { fixture } = await render(HooksComponents.MutationSelectComponent, { imports: mutationStoreRef.imports });
    getRenderCount = fixture.componentInstance.renderCounter.getRenderCount;

    const incrementButton = screen.getByTestId('incrementButton');

    expect(getRenderCount()).toBe(1);

    fireEvent.click(incrementButton);
    await waitMs(200); // give our baseQuery a chance to return
    expect(getRenderCount()).toBe(2);

    fireEvent.click(incrementButton);
    await waitMs(200);
    expect(getRenderCount()).toBe(3);

    const { increment } = mutationApi.endpoints;

    const completeSequence = [
      increment.matchPending,
      increment.matchFulfilled,
      mutationApi.internalActions.unsubscribeMutationResult.match,
      increment.matchPending,
      increment.matchFulfilled,
    ];

    matchSequence(getState().actions, ...completeSequence);
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
