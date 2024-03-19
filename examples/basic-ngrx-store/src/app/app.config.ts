import { type ApplicationConfig, isDevMode } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withEnabledBlockingInitialNavigation,
  withPreloading,
} from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideStoreApi } from 'ngrx-rtk-query';

import { appRoutes } from './app.routes';
import { postsApi } from './posts/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),
    provideStoreDevtools({
      name: 'RTK Query App',
      logOnly: !isDevMode(),
    }),
    provideStoreApi(postsApi),

    provideRouter(
      appRoutes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding(),
      withEnabledBlockingInitialNavigation(),
    ),
  ],
};
