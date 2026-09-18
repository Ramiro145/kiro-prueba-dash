import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { EChartsType } from 'echarts/core';
import { vi } from 'vitest';
import { MOCK_API_LATENCY, mockApiInterceptor } from '../../core/mock-api/mock-api.interceptor';
import { OperationsEffects } from '../../domains/operations/state/operations.effects';
import {
  OPERATIONS_FEATURE_KEY,
  operationsReducer,
} from '../../domains/operations/state/operations.reducer';
import { EchartsEngine } from '../../shared/charts/echart-host/echarts-engine';
import { Overview } from './overview';

describe('Overview operations flow', () => {
  it('renders mock HTTP data and analytics after they cross the NgRx flow', async () => {
    const chart = {
      setOption: vi.fn(),
      resize: vi.fn(),
      dispose: vi.fn(),
    } as unknown as EChartsType;
    await TestBed.configureTestingModule({
      imports: [Overview],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideStore({ [OPERATIONS_FEATURE_KEY]: operationsReducer }),
        provideEffects(OperationsEffects),
        { provide: MOCK_API_LATENCY, useValue: 0 },
        { provide: EchartsEngine, useValue: { create: () => chart } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();

    await vi.waitFor(() => {
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('[data-testid="plant-name"]')?.textContent).toContain(
        'Planta Norte',
      );
      expect(element.querySelectorAll('.process__stage')).toHaveLength(4);
      expect(element.querySelectorAll('[data-testid="kpi-item"]')).toHaveLength(7);
      expect(element.querySelectorAll('app-echart')).toHaveLength(3);
      expect(element.textContent).toContain('1,562 / 1,850');
      expect(element.textContent).toContain('Principal causa de paro');
    });
  });
});
