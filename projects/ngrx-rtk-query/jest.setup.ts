import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';
import { server } from './test/mocks/server';

global.fetch = require('node-fetch');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
