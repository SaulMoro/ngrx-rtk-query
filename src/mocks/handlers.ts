import { counterHandlers } from './counter.handlers';
import { postHandlers } from './post.handlers';

export const handlers = [...counterHandlers, ...postHandlers];
