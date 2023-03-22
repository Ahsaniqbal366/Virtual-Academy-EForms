
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

/**
 * [bootstrapModule] follow up logic taken from this link:
 * https://stackoverflow.com/questions/50968902/angular-service-worker-swupdate-available-not-triggered
 * "For whatever reason, sometimes Angular does not register* the service worker properly."
 *
 * We try to manually register the ngsw-worker.js if this issue arises.
 */
platformBrowserDynamic().bootstrapModule(AppModule).then(() => {
  if ('serviceWorker' in navigator && environment.production) {
    /**
     * TODO - Log this scenario and see if we REALLY need this code. Does it ever happen or is the
     * StackOverflow dude wrong?
     */
    navigator.serviceWorker.register('ngsw-worker.js');
  }
}).catch(err => console.log(err));
