import { rest } from 'msw';

// high tech in-memory storage
let count = 0;
const counters: { [id: string]: number } = {};

/* eslint-disable @typescript-eslint/no-shadow */
export const counterHandlers = [
  rest.get('/count', (_req, res, ctx) => {
    return res(ctx.delay(), ctx.json({ count }));
  }),
  rest.put<{ amount: number }>('/increment', (req, res, ctx) => {
    const { amount } = req.body;
    count = count += amount;

    return res(ctx.delay(500), ctx.json({ count }));
  }),
  rest.put<{ amount: number }>('/decrement', (req, res, ctx) => {
    const { amount } = req.body;
    count = count -= amount;

    return res(ctx.delay(500), ctx.json({ count }));
  }),

  rest.get('/count/:id', (req, res, ctx) => {
    const { id } = req.params;

    let count = counters[id as string];
    if (!count) {
      count = counters[id as string] = 0;
    }

    return res(ctx.delay(), ctx.json({ count }));
  }),
  rest.put<{ amount: number }>('/count/:id/increment', (req, res, ctx) => {
    const { amount } = req.body;
    const { id } = req.params;

    if (typeof counters[id as string] === 'undefined') {
      return res(ctx.delay(), ctx.json({ message: 'Counter not found' }), ctx.status(402));
    }

    const count = (counters[id as string] = counters[id as string] + amount);

    return res(ctx.delay(), ctx.json({ count }));
  }),
  rest.put<{ amount: number }>('/count/:id/decrement', (req, res, ctx) => {
    const { amount } = req.body;
    const { id } = req.params;

    if (typeof counters[id as string] === 'undefined') {
      return res(ctx.delay(), ctx.json({ message: 'Counter not found' }), ctx.status(402));
    }

    const count = (counters[id as string] = counters[id as string] - amount);

    return res(ctx.delay(), ctx.json({ count }));
  }),
];
