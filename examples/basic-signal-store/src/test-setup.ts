import '@analogjs/vitest-angular/setup-snapshots';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import '@angular/compiler';
import '@testing-library/jest-dom';
import { ReadableStream, TransformStream, WritableStream } from 'web-streams-polyfill';

setupTestBed();

// MSW 2.x requires these Web Streams API globals for SSE support
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = ReadableStream as typeof global.ReadableStream;
}
if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = WritableStream as typeof global.WritableStream;
}
if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = TransformStream;
}
