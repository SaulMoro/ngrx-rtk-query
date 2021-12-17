import { worker } from '../mocks/browser';

// add msw mock on dev environment && e2e tests
worker.start({ onUnhandledRequest: 'bypass' });

export const environment = {
  production: false,
};
