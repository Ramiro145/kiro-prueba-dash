import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideStore } from '@ngrx/store';
import { App } from './app';
import { routes } from './app.routes';
import {
  OPERATIONS_FEATURE_KEY,
  operationsReducer,
} from './domains/operations/state/operations.reducer';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideStore({ [OPERATIONS_FEATURE_KEY]: operationsReducer }),
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
