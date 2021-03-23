import { libHandlers } from './lib.handlers';
import { libPostsHandlers } from './lib-posts.handlers';

export const handlers = [...libHandlers, ...libPostsHandlers];
