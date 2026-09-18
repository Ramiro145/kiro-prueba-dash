import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { mockApiInterceptor } from './core/mock-api/mock-api.interceptor';
import { OperationsEffects } from './domains/operations/state/operations.effects';
import {
  OPERATIONS_FEATURE_KEY,
  operationsReducer,
} from './domains/operations/state/operations.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([mockApiInterceptor])),
    provideStore({ [OPERATIONS_FEATURE_KEY]: operationsReducer }),
    provideEffects(OperationsEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
