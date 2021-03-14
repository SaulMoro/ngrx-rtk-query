export type NoInfer<T> = [T][T extends any ? 0 : never];

export function safeAssign<T extends object>(target: T, ...args: Array<Partial<NoInfer<T>>>): void {
  Object.assign(target, ...args);
}

export function capitalize(str: string): string {
  return str.replace(str[0], str[0].toUpperCase());
}
