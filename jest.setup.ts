/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';
import { configure } from '@testing-library/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { default as nodeFetch, Request } from 'node-fetch';
import { server } from 'src/mocks/server';

//@ts-ignore
global.fetch = nodeFetch;
//@ts-ignore
global.Request = Request;

configure({
  defaultImports: [ReactiveFormsModule],
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
