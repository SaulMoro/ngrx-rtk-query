import '@analogjs/vitest-angular/setup-zone';
import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import '@testing-library/jest-dom';
import { TransformStream } from 'web-streams-polyfill';

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = TransformStream;
}
