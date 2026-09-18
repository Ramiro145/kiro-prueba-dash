import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { mockApiInterceptor } from './core/mock-api/mock-api.interceptor';
import { OperationsEffects } from './domains/operations/state/operations.effects';
import { OverviewLifecycleEffects } from './domains/operations/state/overview-lifecycle.effects';
import {
  OPERATIONS_FEATURE_KEY,
  operationsReducer,
} from './domains/operations/state/operations.reducer';
import { PreferencesEffects } from './domains/preferences/state/preferences.effects';
import {
  PREFERENCES_FEATURE_KEY,
  preferencesReducer,
} from './domains/preferences/state/preferences.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideRouterStore(),
    provideHttpClient(withInterceptors([mockApiInterceptor])),
    provideStore({
      router: routerReducer,
      [OPERATIONS_FEATURE_KEY]: operationsReducer,
      [PREFERENCES_FEATURE_KEY]: preferencesReducer,
    }),
    provideEffects(OperationsEffects, OverviewLifecycleEffects, PreferencesEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
