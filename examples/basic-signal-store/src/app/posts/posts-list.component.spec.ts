import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { server } from '../../mocks/node';
import { PostsListComponent } from './posts-list.component';
import { PostsSignalStore } from './posts.store';

describe('PostsListComponent', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => server.close());

  test('should show default posts and add new posts', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(PostsListComponent, {
      providers: [PostsSignalStore],
    });

    const newPostControl = screen.getByPlaceholderText(/New post/i);
    const addPostButton = screen.getByRole('button', { name: /Add post/i });

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();

    expect(await screen.findByRole('link', { name: /A sample post/i })).toBeInTheDocument();
    expect(screen.getByText(/Selected via store: 2 posts/i)).toBeInTheDocument();
    expect(fixture.componentInstance.postsStore.selectedPostsCount()).toBe(2);

    expect(addPostButton).toBeDisabled();
    await user.type(newPostControl, 'New post');
    expect(addPostButton).toBeEnabled();
    await user.click(addPostButton);

    expect(await screen.findByRole('button', { name: /Adding/i })).toBeInTheDocument();
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();

    expect(await screen.findByRole('link', { name: /New post/i })).toBeInTheDocument();
    expect(screen.getByText(/Selected via store: 3 posts/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(fixture.componentInstance.postsStore.selectedPostsCount()).toBe(3);
    });
    expect(addPostButton).toBeDisabled();
    expect(newPostControl).toHaveValue('');
  });

  test('should show empty if not posts', async () => {
    server.use(http.get('http://api.localhost.com/posts', async () => HttpResponse.json([])));

    const { fixture } = await render(PostsListComponent, {
      providers: [PostsSignalStore],
    });

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
    expect(await screen.findByText(/No posts/i)).toBeInTheDocument();
    expect(fixture.componentInstance.postsStore.selectedPostsCount()).toBe(0);
  });

  test('should show error if fetch fails', async () => {
    server.use(
      http.get(
        'http://api.localhost.com/posts',
        async () =>
          new HttpResponse(null, {
            status: 404,
          }),
      ),
    );

    const { fixture } = await render(PostsListComponent, {
      providers: [PostsSignalStore],
    });

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();

    expect(await screen.findByText(/Error/i)).toBeInTheDocument();
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No posts/i)).not.toBeInTheDocument();
    expect(fixture.componentInstance.postsStore.selectedPostsCount()).toBe(0);
  });
});
