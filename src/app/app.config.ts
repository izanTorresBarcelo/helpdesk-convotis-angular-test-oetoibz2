import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { fakeBackendInterceptor } from './core/api/fake-backend.interceptor';

// Nota: desde Angular 21 las aplicaciones son zoneless por defecto.
// Este proyecto NO incluye zone.js.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([fakeBackendInterceptor])),
  ],
};
