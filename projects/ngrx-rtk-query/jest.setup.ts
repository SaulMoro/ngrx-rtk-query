/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';
import { default as nodeFetch, Request } from 'node-fetch';
import { server } from './test/mocks/server';

//@ts-ignore
global.fetch = nodeFetch;
//@ts-ignore
global.Request = Request;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
