import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';
import { configure } from '@testing-library/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { server } from 'src/mocks/server';

global.fetch = require('node-fetch');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

configure({
  defaultImports: [ReactiveFormsModule],
});
