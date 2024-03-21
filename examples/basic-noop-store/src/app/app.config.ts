import { type ApplicationConfig } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withEnabledBlockingInitialNavigation,
  withPreloading,
} from '@angular/router';
import { provideNoopStoreApi } from 'ngrx-rtk-query';

import { appRoutes } from './app.routes';
import { postsApi } from './posts/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNoopStoreApi(postsApi),

    provideRouter(
      appRoutes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding(),
      withEnabledBlockingInitialNavigation(),
    ),
  ],
};
