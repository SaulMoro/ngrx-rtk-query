import { provideStore } from '@ngrx/store';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { provideStoreApi } from 'ngrx-rtk-query/store';

import { server } from '../../mocks/node';
import { postsApi } from './api';
import { PostsListComponent } from './posts-list.component';

describe('PostsListComponent', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    server.resetHandlers();
    postsApi.dispatch(postsApi.util.resetApiState());
  });
  afterAll(() => server.close());

  test('shows default posts and adds new posts', async () => {
    const user = userEvent.setup();
    await render(PostsListComponent, {
      providers: [provideStore(), provideStoreApi(postsApi)],
    });

    const newPostControl = screen.getByPlaceholderText(/New post/i);
    const addPostButton = screen.getByRole('button', { name: /Add post/i });

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();

    expect(await screen.findByRole('link', { name: /A sample post/i })).toBeInTheDocument();

    expect(addPostButton).toBeDisabled();
    await user.type(newPostControl, 'New post');
    expect(addPostButton).toBeEnabled();
    await user.click(addPostButton);

    expect(await screen.findByRole('button', { name: /Adding/i })).toBeInTheDocument();
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();

    expect(await screen.findByRole('link', { name: /New post/i })).toBeInTheDocument();
    expect(addPostButton).toBeDisabled();
    expect(newPostControl).toHaveValue('');
  });

  test('shows the empty state when no posts are returned', async () => {
    server.use(http.get('http://api.localhost.com/posts', async () => HttpResponse.json([])));

    await render(PostsListComponent, {
      providers: [provideStore(), provideStoreApi(postsApi)],
    });

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
    expect(await screen.findByText(/No posts/i)).toBeInTheDocument();
  });

  test('shows the error state when posts fail to load', async () => {
    server.use(
      http.get(
        'http://api.localhost.com/posts',
        async () =>
          new HttpResponse(null, {
            status: 404,
          }),
      ),
    );

    await render(PostsListComponent, {
      providers: [provideStore(), provideStoreApi(postsApi)],
    });

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();

    expect(await screen.findByText(/Error/i)).toBeInTheDocument();
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No posts/i)).not.toBeInTheDocument();
  });
});
