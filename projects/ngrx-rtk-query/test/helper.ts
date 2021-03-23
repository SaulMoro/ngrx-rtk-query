import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import { StoreRtkQueryModule } from 'ngrx-rtk-query';

export const DEFAULT_DELAY_MS = 150;

export async function waitMs(time = DEFAULT_DELAY_MS) {
  const now = Date.now();
  while (Date.now() < now + time) {
    await new Promise((res) => process.nextTick(res));
  }
}

export function setupApiStore<
  A extends { reducerPath: any; reducer: ActionReducer<any, any>; metareducer: MetaReducer<any> },
  R extends Record<string, ActionReducer<any, any>>
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

  return refObj;
}
