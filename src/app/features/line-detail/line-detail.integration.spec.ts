import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { vi } from 'vitest';
import { MOCK_API_LATENCY, mockApiInterceptor } from '../../core/mock-api/mock-api.interceptor';
import { LineDetailEffects } from '../../domains/operations/state/line-detail.effects';
import {
  LINE_DETAIL_FEATURE_KEY,
  lineDetailReducer,
} from '../../domains/operations/state/line-detail.reducer';
import { LineDetail } from './line-detail';

describe('Line detail flow', () => {
  it('loads a deep-linked line through Router Store, NgRx and the mock API', async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'lines/:lineId', component: LineDetail }]),
        provideRouterStore(),
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideStore({ router: routerReducer, [LINE_DETAIL_FEATURE_KEY]: lineDetailReducer }),
        provideEffects(LineDetailEffects),
        { provide: MOCK_API_LATENCY, useValue: 0 },
      ],
    }).compileComponents();
    const harness = await RouterTestingHarness.create(
      '/lines/welding-01?plant=plant-north&shift=morning&line=welding-01',
    );

    await vi.waitFor(() => {
      TestBed.tick();
      expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
        'Soldadura 01',
      );
      expect(harness.routeNativeElement?.textContent).toContain('Ajuste de soldadura');
      expect(harness.routeNativeElement?.textContent).toContain('Cordón irregular');
    });
  });
});
