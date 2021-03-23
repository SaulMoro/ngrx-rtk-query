import { fireEvent, render, waitFor, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { QueryStatus } from '@rtk-incubator/rtk-query';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { getState } from '../src/lib/thunk.service';
import { setupApiStore, waitMs } from './helper';
import { api, defaultApi, libPostsApi, resetAmount } from './helper-apis';
import {
  FetchingComponent,
  FetchingLoadingComponent,
  LoadingComponent,
  MutationComponent,
  PrefetchHighPriorityComponent,
  RefetchOnMountComponent,
  RefetchOnMountSkipComponent,
  HIGH_PRIORITY_USER_ID,
  PrefetchLowPriorityComponent,
  LOW_PRIORITY_USER_ID,
  PrefetchUncachedComponent,
  RefetchOnMountDefaultsComponent,
  PostsContainerComponent,
  PostComponent,
  SelectedPostComponent,
  PostsHookContainerComponent,
  SelectedPostHookComponent,
} from './helper-components';
import { resetPostsApi } from './mocks/lib-posts.handlers';

const storeRef = setupApiStore(api);

afterEach(() => {
  resetAmount();
});

describe('hooks tests', () => {
  test('useQuery hook sets isFetching=true whenever a request is in flight', async () => {
    await render(FetchingComponent, { imports: storeRef.imports });

    const fetchControl = screen.getByTestId('isFetching');
    const incrementControl = screen.getByRole('button', { name: /Increment value/i });

    await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
    fireEvent.click(incrementControl);
    await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
    await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
    fireEvent.click(incrementControl);
    // Being that nothing has changed in the args, this should never fire.
    expect(fetchControl).toHaveTextContent('false');
  });

  test('useQuery hook sets isLoading=true only on initial request', async () => {
    await render(LoadingComponent, { imports: storeRef.imports });

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
    await render(FetchingLoadingComponent, { imports: storeRef.imports });

    const fetchControl = screen.getByTestId('isFetching');
    const loadingControl = screen.getByTestId('isLoading');
    const incrementControl = screen.getByRole('button', { name: /Increment value/i });
    const refetchControl = screen.getByRole('button', { name: /Refetch/i });

    await waitFor(() => {
      expect(loadingControl).toHaveTextContent('false');
      expect(fetchControl).toHaveTextContent('false');
    });
    fireEvent.click(incrementControl);
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
    fireEvent.click(incrementControl);
    // Being that we already have data, isLoading should be false
    await waitFor(() => {
      expect(loadingControl).toHaveTextContent('false');
      expect(fetchControl).toHaveTextContent('false');
    });
    // Make sure the request is done for sure.
    await waitFor(() => {
      expect(loadingControl).toHaveTextContent('false');
      expect(fetchControl).toHaveTextContent('false');
    });
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
  });

  test('useQuery hook respects refetchOnMountOrArgChange: true', async () => {
    const { rerender } = await render(RefetchOnMountComponent, { imports: storeRef.imports });

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
    const { rerender } = await render(RefetchOnMountComponent, {
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
    const { rerender } = await render(RefetchOnMountComponent, {
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
    await render(RefetchOnMountSkipComponent, { imports: storeRef.imports });

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
    const { rerender } = await render(RefetchOnMountSkipComponent, { imports: storeRef.imports });

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
        skip$.pipe(map((skip) => ({ refetchOnMountOrArgChange: 0.5, skip }))),
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
        skip$.pipe(map((skip) => ({ refetchOnMountOrArgChange: 0.5, skip }))),
      ),
    });

    // toggle skip -> true... will cause a refetch as the time criteria is now satisfied
    fireEvent.click(skipControl);

    await waitFor(() => expect(fetchControl).toHaveTextContent('true'));
    await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

    await waitFor(() => expect(amount).toHaveTextContent('2'));
  });

  test('useMutation hook sets and unsets the isLoading flag when running', async () => {
    await render(MutationComponent, { imports: storeRef.imports });

    const loadingControl = screen.getByTestId('isLoading');
    const updateControl = screen.getByRole('button', { name: /Update User/i });

    await waitFor(() => expect(loadingControl).toHaveTextContent('false'));
    fireEvent.click(updateControl);
    await waitFor(() => expect(loadingControl).toHaveTextContent('true'));
    await waitFor(() => expect(loadingControl).toHaveTextContent('false'));
  });

  test('useMutation hook sets data to the resolved response on success', async () => {
    const result = { name: 'Banana' };

    await render(MutationComponent, { imports: storeRef.imports });

    const resultControl = screen.getByTestId('result');
    const updateControl = screen.getByRole('button', { name: /Update User/i });

    fireEvent.click(updateControl);
    await waitFor(() => expect(resultControl).toHaveTextContent(JSON.stringify(result)));
  });

  test('usePrefetch respects force arg', async () => {
    await render(PrefetchHighPriorityComponent, { imports: storeRef.imports });

    const fetchControl = screen.getByTestId('isFetching');
    const prefetchControl = screen.getByTestId('highPriority');

    // Resolve initial query
    await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

    userEvent.hover(prefetchControl);
    expect(api.endpoints.getUser.select(HIGH_PRIORITY_USER_ID)(getState())).toEqual({
      data: undefined,
      endpointName: 'getUser',
      error: undefined,
      fulfilledTimeStamp: expect.any(Number),
      isError: false,
      isLoading: true,
      isSuccess: false,
      isUninitialized: false,
      originalArgs: HIGH_PRIORITY_USER_ID,
      requestId: expect.any(String),
      startedTimeStamp: expect.any(Number),
      status: QueryStatus.pending,
    });

    await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

    expect(api.endpoints.getUser.select(HIGH_PRIORITY_USER_ID)(getState())).toEqual({
      data: undefined,
      endpointName: 'getUser',
      fulfilledTimeStamp: expect.any(Number),
      isError: false,
      isLoading: false,
      isSuccess: true,
      isUninitialized: false,
      originalArgs: HIGH_PRIORITY_USER_ID,
      requestId: expect.any(String),
      startedTimeStamp: expect.any(Number),
      status: QueryStatus.fulfilled,
    });
  });

  test('usePrefetch does not make an additional request if already in the cache and force=false', async () => {
    await render(PrefetchLowPriorityComponent, { imports: storeRef.imports });

    const fetchControl = screen.getByTestId('isFetching');
    const prefetchControl = screen.getByTestId('lowPriority');

    // Resolve initial query
    await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

    userEvent.hover(prefetchControl);
    expect(api.endpoints.getUser.select(LOW_PRIORITY_USER_ID)(getState())).toEqual({
      data: undefined,
      endpointName: 'getUser',
      fulfilledTimeStamp: expect.any(Number),
      isError: false,
      isLoading: false,
      isSuccess: true,
      isUninitialized: false,
      originalArgs: LOW_PRIORITY_USER_ID,
      requestId: expect.any(String),
      startedTimeStamp: expect.any(Number),
      status: QueryStatus.fulfilled,
    });

    await waitMs();

    expect(api.endpoints.getUser.select(LOW_PRIORITY_USER_ID)(getState())).toEqual({
      data: undefined,
      endpointName: 'getUser',
      fulfilledTimeStamp: expect.any(Number),
      isError: false,
      isLoading: false,
      isSuccess: true,
      isUninitialized: false,
      originalArgs: LOW_PRIORITY_USER_ID,
      requestId: expect.any(String),
      startedTimeStamp: expect.any(Number),
      status: QueryStatus.fulfilled,
    });
  });

  test('usePrefetch respects ifOlderThan when it evaluates to true', async () => {
    await render(PrefetchLowPriorityComponent, {
      imports: storeRef.imports,
      componentProperties: {
        prefetchUser: () => api.usePrefetch('getUser', { ifOlderThan: 0.2 })(LOW_PRIORITY_USER_ID),
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
    expect(api.endpoints.getUser.select(LOW_PRIORITY_USER_ID)(getState())).toEqual({
      data: undefined,
      endpointName: 'getUser',
      fulfilledTimeStamp: expect.any(Number),
      isError: false,
      isLoading: true,
      isSuccess: false,
      isUninitialized: false,
      originalArgs: LOW_PRIORITY_USER_ID,
      requestId: expect.any(String),
      startedTimeStamp: expect.any(Number),
      status: QueryStatus.pending,
    });

    await waitFor(() => expect(fetchControl).toHaveTextContent('false'));

    expect(api.endpoints.getUser.select(LOW_PRIORITY_USER_ID)(getState())).toEqual({
      data: undefined,
      endpointName: 'getUser',
      fulfilledTimeStamp: expect.any(Number),
      isError: false,
      isLoading: false,
      isSuccess: true,
      isUninitialized: false,
      originalArgs: LOW_PRIORITY_USER_ID,
      requestId: expect.any(String),
      startedTimeStamp: expect.any(Number),
      status: QueryStatus.fulfilled,
    });
  });

  test('usePrefetch returns the last success result when ifOlderThan evalutes to false', async () => {
    await render(PrefetchLowPriorityComponent, {
      imports: storeRef.imports,
      componentProperties: {
        prefetchUser: () => api.usePrefetch('getUser', { ifOlderThan: 10 })(LOW_PRIORITY_USER_ID),
      },
    });

    const fetchControl = screen.getByTestId('isFetching');
    const prefetchControl = screen.getByTestId('lowPriority');

    // Resolve initial query
    await waitFor(() => expect(fetchControl).toHaveTextContent('false'));
    await waitMs();

    // Get a snapshot of the last result
    const latestQueryData = api.endpoints.getUser.select(LOW_PRIORITY_USER_ID)(getState());

    userEvent.hover(prefetchControl);
    //  Serve up the result from the cache being that the condition wasn't met
    expect(api.endpoints.getUser.select(LOW_PRIORITY_USER_ID)(getState())).toEqual(latestQueryData);
  });

  test('usePrefetch executes a query even if conditions fail when the cache is empty', async () => {
    await render(PrefetchUncachedComponent, { imports: storeRef.imports });

    const prefetchControl = screen.getByTestId('lowPriority');

    userEvent.hover(prefetchControl);

    expect(api.endpoints.getUser.select(LOW_PRIORITY_USER_ID)(getState())).toEqual({
      endpointName: 'getUser',
      isError: false,
      isLoading: true,
      isSuccess: false,
      isUninitialized: false,
      originalArgs: LOW_PRIORITY_USER_ID,
      requestId: expect.any(String),
      startedTimeStamp: expect.any(Number),
      status: 'pending',
    });
  });
});

describe('hooks with createApi defaults set', () => {
  const storeRef = setupApiStore(defaultApi);

  test('useQuery hook respects refetchOnMountOrArgChange: true when set in createApi options', async () => {
    const { rerender } = await render(RefetchOnMountDefaultsComponent, { imports: storeRef.imports });

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
    const { rerender } = await render(RefetchOnMountDefaultsComponent, { imports: storeRef.imports });

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

describe('selectFromResult behaviors', () => {
  const storeRef = setupApiStore(libPostsApi);

  beforeEach(() => {
    resetPostsApi();
  });

  test('useQueryState serves a deeply memoized value and does not rerender unnecessarily', async () => {
    await render(PostsContainerComponent, {
      declarations: [PostComponent, SelectedPostComponent],
      imports: storeRef.imports,
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
    await render(PostsHookContainerComponent, {
      declarations: [PostComponent, SelectedPostHookComponent],
      imports: storeRef.imports,
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
    await render(PostsHookContainerComponent, {
      declarations: [PostComponent, SelectedPostHookComponent],
      imports: storeRef.imports,
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
});
