import { type Type } from '@angular/core';
import { type RenderComponentOptions, render } from '@testing-library/angular';

import { provideNoopStoreApi } from 'ngrx-rtk-query/noop-store';

type NoopStoreApi = Parameters<typeof provideNoopStoreApi>[0];

export const renderWithNoopStoreApi = <TComponent>(
  component: Type<TComponent>,
  api: NoopStoreApi,
  options: RenderComponentOptions<TComponent> = {},
) => {
  const { providers = [], ...renderOptions } = options;

  return render(component, {
    ...renderOptions,
    providers: [...providers, provideNoopStoreApi(api)],
  });
};
