import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { App } from './app';
import { routes } from './app.routes';
import {
  OPERATIONS_FEATURE_KEY,
  operationsReducer,
} from './domains/operations/state/operations.reducer';
import {
  PREFERENCES_FEATURE_KEY,
  preferencesReducer,
} from './domains/preferences/state/preferences.reducer';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideRouterStore(),
        provideStore({
          router: routerReducer,
          [OPERATIONS_FEATURE_KEY]: operationsReducer,
          [PREFERENCES_FEATURE_KEY]: preferencesReducer,
        }),
      ],
    }).compileComponents();
  });

  it('creates the application shell', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('redirects the root route to the plant overview', async () => {
    const harness = await RouterTestingHarness.create('/');

    expect(TestBed.inject(Router).url).toBe('/overview');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      'Resumen de planta',
    );
  });
});
