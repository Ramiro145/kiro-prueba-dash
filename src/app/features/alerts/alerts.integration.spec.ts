import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { vi } from 'vitest';
import { MOCK_API_LATENCY, mockApiInterceptor } from '../../core/mock-api/mock-api.interceptor';
import { AlertsEffects } from '../../domains/alerts/state/alerts.effects';
import { ALERTS_FEATURE_KEY, alertsReducer } from '../../domains/alerts/state/alerts.reducer';
import { Alerts } from './alerts';

describe('alerts flow', () => {
  it('loads alerts from a shared URL context through NgRx and the mock API', async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'alerts', component: Alerts }]),
        provideRouterStore(),
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideStore({ router: routerReducer, [ALERTS_FEATURE_KEY]: alertsReducer }),
        provideEffects(AlertsEffects),
        { provide: MOCK_API_LATENCY, useValue: 0 },
      ],
    }).compileComponents();
    const harness = await RouterTestingHarness.create('/alerts?plant=plant-north&shift=morning');

    await vi.waitFor(() => {
      TestBed.tick();
      expect(
        harness.routeNativeElement?.querySelectorAll('[data-testid="alert-row"]'),
      ).toHaveLength(6);
      expect(harness.routeNativeElement?.textContent).toContain('Temperatura fuera de rango');
    });
  });
});
