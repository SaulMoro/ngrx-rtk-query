import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    // https://netbasal.com/reduce-change-detection-cycles-with-event-coalescing-in-angular-c4037199859f
    ngZoneEventCoalescing: true,
  })
  .catch((err) => console.error(err));
