import { createEntityAdapter } from '@reduxjs/toolkit';
import { HttpResponse, delay, http } from 'msw';

import { type Post } from '../app/posts/post.model';

// high tech in-memory storage
let startingId = 3; // Just a silly counter for usage when adding new posts

const adapter = createEntityAdapter<Post>();
const { selectAll, selectById } = adapter.getSelectors();

let state = adapter.getInitialState();
state = adapter.setAll(state, [
  { id: 1, name: 'A sample post', fetched_at: new Date().toUTCString() },
  { id: 2, name: 'A post about rtk-query', fetched_at: new Date().toUTCString() },
]);

export const handlers = [
  http.get('http://api.localhost.com/posts', () => {
    delay();
    return HttpResponse.json(selectAll(state));
  }),
  http.get('http://api.localhost.com/posts/:id', async ({ params }) => {
    const { id } = params;
    await delay();

    const post = selectById(state, +id);
    if (!post) return HttpResponse.error();

    state = adapter.updateOne(state, { id: +id, changes: { fetched_at: new Date().toUTCString() } });

    return HttpResponse.json(post);
  }),
  http.post('http://api.localhost.com/posts', async ({ request }) => {
    const post = (await request.json()) as Post;
    await delay();

    startingId += 1;
    state = adapter.addOne(state, { ...post, id: startingId } as Post);

    return HttpResponse.json(selectById(state, startingId));
  }),
  http.put('http://api.localhost.com/posts/:id', async ({ params, request }) => {
    const { id } = params;
    const changes = (await request.json()) as Partial<Post>;
    await delay();

    state = adapter.updateOne(state, { id: +id, changes });

    return HttpResponse.json(selectById(state, +id));
  }),
  http.delete('http://api.localhost.com/posts/:id', async ({ params }) => {
    const { id } = params;
    await delay();

    state = adapter.removeOne(state, +id);

    return HttpResponse.json({ id: +id, success: true });
  }),
];
