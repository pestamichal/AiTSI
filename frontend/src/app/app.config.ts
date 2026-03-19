import {
  importProvidersFrom,
} from '@angular/core';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import {environment} from '@environments/environments';
import { SocialLoginModule, SocialAuthServiceConfig, SOCIAL_AUTH_CONFIG } from '@abacritt/angularx-social-login';
import {unauthorizedInterceptor} from '@core';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptors, withInterceptorsFromDi,
} from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi(), withInterceptors([unauthorizedInterceptor])),
    provideRouter(routes),
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              environment.google_auth_client_id,
              {
                scopes: environment.scope,
              }
            )
          }
        ],
        onError: (err) => {
          console.error('auth plugin: ', err);
        }
      } as SocialAuthServiceConfig,
    },
    importProvidersFrom(SocialLoginModule),
  ]
};
