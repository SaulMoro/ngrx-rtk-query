import { rest } from 'msw';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { Post } from '@app/features/posts/models';

// high tech in-memory storage
let startingId = 3; // Just a silly counter for usage when adding new posts

const adapter = createEntityAdapter<Post>();

let state = adapter.getInitialState();
state = adapter.setAll(state, [
  { id: 1, name: 'A sample post', fetched_at: new Date().toUTCString() },
  { id: 2, name: 'A post about rtk-query', fetched_at: new Date().toUTCString() },
]);

export const postHandlers = [
  rest.get('/posts', (_req, res, ctx) => {
    return res(ctx.delay(300), ctx.json(Object.values(state.entities)));
  }),

  rest.post('/posts', (req, res, ctx) => {
    const post = req.body as Partial<Post>;
    startingId += 1;
    state = adapter.addOne(state, { ...post, id: startingId } as Post);
    return res(ctx.json(Object.values(state.entities)), ctx.delay(400));
  }),

  rest.get('/posts/:id', (req, res, ctx) => {
    const { id } = req.params as { id: string };
    state = adapter.updateOne(state, { id, changes: { fetched_at: new Date().toUTCString() } });
    return res(ctx.json(state.entities[id]), ctx.delay(400));
  }),

  rest.put('/posts/:id', (req, res, ctx) => {
    const { id } = req.params as { id: string };
    const changes = req.body as Partial<Post>;

    state = adapter.updateOne(state, { id, changes });

    return res(ctx.json(state.entities[id]), ctx.delay(400));
  }),

  rest.delete('/posts/:id', (req, res, ctx) => {
    const { id } = req.params as { id: string };

    state = adapter.removeOne(state, id);

    return res(
      ctx.json({
        id,
        success: true,
      }),
      ctx.delay(600),
    );
  }),
];
