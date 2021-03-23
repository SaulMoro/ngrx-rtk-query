import { rest } from 'msw';
import { Post } from '../helper-apis';

let startingId = 3;
const initialPosts = [
  { id: 1, name: 'A sample post', fetched_at: new Date().toUTCString() },
  { id: 2, name: 'A post about rtk-query', fetched_at: new Date().toUTCString() },
];
let posts = [] as typeof initialPosts;

export const resetPostsApi = () => {
  startingId = 3;
  posts = [...initialPosts];
};

export const libPostsHandlers = [
  rest.get('http://example.com/posts', (req, res, ctx) => {
    return res(ctx.json(posts));
  }),
  rest.put<Partial<Post>>('http://example.com/posts/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const idx = posts.findIndex((post) => post.id === id);

    const newPosts = posts.map((post, index) =>
      index !== idx
        ? post
        : {
            ...req.body,
            id,
            name: req.body.name || post.name,
            fetched_at: new Date().toUTCString(),
          },
    );
    posts = [...newPosts];

    return res(ctx.json(posts));
  }),
  rest.post('http://example.com/posts', (req, res, ctx) => {
    const post = req.body as Omit<Post, 'id'>;
    startingId += 1;
    posts.concat({ ...post, fetched_at: new Date().toISOString(), id: startingId });
    return res(ctx.json(posts));
  }),
];
