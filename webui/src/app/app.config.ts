import { ApplicationConfig, ErrorHandler, importProvidersFrom, inject, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { createUrlTreeFromSnapshot, provideRouter, Router, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DefaultHammerConfig, ErrorHandlerService, httpErrorInterceptor } from '@app/core';
import { HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
import { initOidc, OIDC_ROUTES } from '@edgeflare/ng-oidc';
import { environment } from '@env';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withViewTransitions({
        onViewTransitionCreated: ({ transition, to }) => {
          const router = inject(Router);
          const toTree = createUrlTreeFromSnapshot(to, []);
          // Skip the transition if the only thing changing is the fragment and queryParams
          if (
            router.isActive(toTree, {
              paths: 'exact',
              matrixParams: 'exact',
              fragment: 'ignored',
              queryParams: 'ignored',
            })
          ) {
            transition.skipTransition();
          }
        },
      }),
    ),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi(),
      withInterceptors([httpErrorInterceptor]),
    ),
    importProvidersFrom(
      MatSnackBarModule,
      HammerModule
    ),
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
    { provide: HAMMER_GESTURE_CONFIG, useClass: DefaultHammerConfig },

    ...initOidc(environment.oidcConfig),
    provideRouter(OIDC_ROUTES),
  ]
};
