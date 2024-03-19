import { type NoInfer } from '@reduxjs/toolkit/dist/tsHelpers';

export function safeAssign<T extends object>(target: T, ...args: Array<Partial<NoInfer<T>>>): T {
  return Object.assign(target, ...args);
}
