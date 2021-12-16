import { NoInfer } from '@reduxjs/toolkit/dist/tsHelpers';

export function safeAssign<T extends object>(target: T, ...args: Array<Partial<NoInfer<T>>>) {
  Object.assign(target, ...args);
}
