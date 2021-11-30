/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import type { AnyAction } from '@reduxjs/toolkit';
import { dispatch, StoreRtkQueryModule } from 'ngrx-rtk-query';

export const DEFAULT_DELAY_MS = 150;

export async function waitMs(time = DEFAULT_DELAY_MS) {
  const now = Date.now();
  while (Date.now() < now + time) {
    await new Promise((res) => process.nextTick(res));
  }
}

export const useRenderCounter = () => {
  let count = 0;
  const increment = () => (count = count + 1);
  return { increment, getRenderCount: () => count };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchSequence(...matchers: Array<(arg: any) => boolean>): R;
    }
  }
}

expect.extend({
  toMatchSequence(_actions: AnyAction[], ...matchers: Array<(arg: any) => boolean>) {
    const actions = _actions.concat();
    actions.shift(); // remove INIT

    for (let i = 0; i < matchers.length; i++) {
      if (!matchers[i](actions[i])) {
        return {
          message: () => `Action ${actions[i].type} does not match sequence at position ${i}.`,
          pass: false,
        };
      }
    }

    return {
      message: () => `All actions match the sequence.`,
      pass: true,
    };
  },
});

export const actionsReducer = {
  actions: (state: AnyAction[] = [], action: AnyAction) => {
    return [...state, action];
  },
};

export function setupApiStore<
  A extends {
    reducerPath: any;
    reducer: ActionReducer<any, any>;
    metareducer: MetaReducer<any>;
    util: { resetApiState(): any };
  },
  R extends Record<string, ActionReducer<any, any>>,
>(api: A, extraReducers?: R, withoutListeners?: boolean) {
  const getStore = () =>
    StoreModule.forRoot(
      { [api.reducerPath]: api.reducer, ...extraReducers },
      {
        metaReducers: [api.metareducer],
        runtimeChecks: { strictStateSerializability: true, strictStateImmutability: true },
      },
    );
  type StoreType = ReturnType<typeof getStore>;
  const initialStore = getStore() as StoreType;

  const getRTKQueryStore = () => StoreRtkQueryModule.forRoot({ setupListeners: !withoutListeners });
  const initialRTKQueryStore = getRTKQueryStore();

  const refObj = {
    api,
    store: initialStore,
    rtkQueryStore: initialRTKQueryStore,
    imports: [initialStore, initialRTKQueryStore],
  };

  beforeEach(() => {
    const store = getStore() as StoreType;
    const rtkQueryStore = getRTKQueryStore();
    refObj.store = store;
    refObj.rtkQueryStore = rtkQueryStore;
    refObj.imports = [store, rtkQueryStore];
  });

  afterEach(() => {
    dispatch(api.util.resetApiState());
  });

  return refObj;
}

// type test helpers

export declare type IsAny<T, True, False = never> = true | false extends (T extends never ? true : false)
  ? True
  : False;

export declare type IsUnknown<T, True, False = never> = unknown extends T ? IsAny<T, False, True> : False;

export function expectType<T>(t: T): T {
  return t;
}

type Equals<T, U> = IsAny<T, never, IsAny<U, never, [T] extends [U] ? ([U] extends [T] ? any : never) : never>>;
export function expectExactType<T>(t: T) {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return <U extends Equals<T, U>>(u: U) => {};
}

type EnsureUnknown<T> = IsUnknown<T, any, never>;
export function expectUnknown<T extends EnsureUnknown<T>>(t: T) {
  return t;
}

type EnsureAny<T> = IsAny<T, any, never>;
export function expectExactAny<T extends EnsureAny<T>>(t: T) {
  return t;
}

type IsNotAny<T> = IsAny<T, never, any>;
export function expectNotAny<T extends IsNotAny<T>>(t: T): T {
  return t;
}

expectType<string>('5' as string);
expectType<string>('5' as const);
expectType<string>('5' as any);
expectExactType('5' as const)('5' as const);
// @ts-expect-error
expectExactType('5' as string)('5' as const);
// @ts-expect-error
expectExactType('5' as any)('5' as const);
expectUnknown('5' as unknown);
// @ts-expect-error
expectUnknown('5' as const);
// @ts-expect-error
expectUnknown('5' as any);
expectExactAny('5' as any);
// @ts-expect-error
expectExactAny('5' as const);
// @ts-expect-error
expectExactAny('5' as unknown);
