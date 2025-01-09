export type NoInfer<T> = [T][T extends any ? 0 : never];

export function safeAssign<T extends object>(target: T, ...args: Array<Partial<NoInfer<T>>>): T {
  return Object.assign(target, ...args);
}
