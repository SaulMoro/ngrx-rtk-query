import { signal } from '@angular/core';
import { describe, expect, test } from 'vitest';

import { mergeSignalProxy, signalProxy } from '../core/src/utils';

describe('signal proxy utilities', () => {
  test('does not shadow non-configurable function properties', () => {
    const target = function trigger() {
      return 'target';
    };
    Object.defineProperty(target, 'locked', {
      configurable: false,
      value: null,
      writable: false,
    });
    const source = signal({
      locked: 'selected locked',
      name: 'selected name',
    });

    const proxy = mergeSignalProxy(target, signalProxy(source));

    expect(Reflect.get(proxy, 'name')()).toBe('selected name');
    expect(Reflect.get(proxy, 'locked')).toBeNull();
  });
});
