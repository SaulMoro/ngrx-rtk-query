/* eslint-disable @typescript-eslint/no-explicit-any */
import { rest } from 'msw';

// high tech in-memory storage
let count = 0;

const counters: { [id: string]: number } = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let intervals: any = [];
let spookyMode = true;

export const handlers = [
  rest.get('/error', (req, res, ctx) => {
    return res(
      ctx.delay(),
      ctx.status(500),
      ctx.json({
        message: 'what is this doing!',
        data: [{ some: 'key' }],
      })
    );
  }),
  rest.get('/network-error', (req, res, ctx) => {
    return res.networkError('Fake network error');
  }),
  rest.get('/mismatched-header-error', (req, res, ctx) => {
    return res(ctx.delay(), ctx.text('oh hello there'), ctx.set('Content-Type', 'application/hal+banana'));
  }),
  rest.get('https://mocked.data', (req, res, ctx) => {
    return res(
      ctx.delay(),
      ctx.json({
        great: 'success',
      })
    );
  }),
  rest.put<{ amount: number }>('/increment', (req, res, ctx) => {
    const { amount } = req.body;
    count = count += amount;

    return res(ctx.delay(), ctx.json({ count }));
  }),
  rest.put<{ amount: number }>('/decrement', (req, res, ctx) => {
    const { amount } = req.body;
    count = count -= amount;

    return res(ctx.delay(), ctx.json({ count }));
  }),
  rest.get('/count', (req, res, ctx) => {
    return res(ctx.delay(), ctx.json({ count }));
  }),
  rest.get('/count/:id', (req, res, ctx) => {
    const { id } = req.params;

    let count = counters[id];
    if (!count) {
      count = counters[id] = 0;
    }

    if (spookyMode) {
      intervals.push(
        setInterval(() => {
          counters[id] = counters[id] + Math.floor(Math.random() * 10) + 1;
        }, 2000)
      );
    }

    return res(ctx.delay(), ctx.json({ count }), ctx.delay(300));
  }),
  rest.put('/stop', (req, res, ctx) => {
    intervals.forEach((int: any) => {
      clearInterval(int);
    });
    intervals = [];
    spookyMode = false;

    return res(ctx.delay(), ctx.json({ success: true, message: 'Intervals stopped. No more shennanigans' }));
  }),
  rest.put<{ amount: number }>('/count/:id/increment', (req, res, ctx) => {
    const { amount } = req.body;
    const { id } = req.params;

    if (typeof counters[id] === 'undefined') {
      return res(ctx.delay(), ctx.json({ message: 'Counter not found' }), ctx.status(402));
    }

    const count = (counters[id] = counters[id] + amount);

    return res(ctx.delay(), ctx.json({ count }));
  }),
  rest.put<{ amount: number }>('/count/:id/decrement', (req, res, ctx) => {
    const { amount } = req.body;
    const { id } = req.params;

    if (typeof counters[id] === 'undefined') {
      return res(ctx.delay(), ctx.json({ message: 'Counter not found' }), ctx.status(402));
    }

    const count = (counters[id] = counters[id] - amount);

    return res(ctx.delay(), ctx.json({ count }));
  }),
];
