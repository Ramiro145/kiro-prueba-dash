import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { vi } from 'vitest';
import { OperationsActions } from '../../domains/operations/state/operations.actions';
import {
  DEFAULT_DASHBOARD_FILTERS,
  selectDashboardFilters,
} from '../../domains/operations/state/dashboard-filters.selectors';
import {
  OperationsViewModel,
  selectOperationsAnalyticsData,
  selectOperationsLineOptions,
  selectDashboardOperationsViewModel,
} from '../../domains/operations/state/operations.selectors';
import { Overview } from './overview';

const readyViewModel: OperationsViewModel = {
  status: 'ready',
  refreshing: false,
  stale: false,
  plantName: 'Planta Norte',
  location: 'Monterrey, NL',
  shiftName: 'Turno mañana',
  updatedAt: '2026-09-18T12:00:00.000Z',
  error: null,
  kpis: [
    {
      id: 'oee',
      label: 'OEE',
      value: '78.0%',
      supportingText: 'Meta ≥ 85.0%',
      tone: 'warning',
    },
  ],
  lines: [
    { id: 'cutting-01', name: 'Corte 01', stageName: 'Corte', status: 'operational' },
    { id: 'forming-01', name: 'Conformado 01', stageName: 'Conformado', status: 'reduced' },
    { id: 'welding-01', name: 'Soldadura 01', stageName: 'Soldadura', status: 'stopped' },
    { id: 'finishing-01', name: 'Acabado 01', stageName: 'Acabado', status: 'noData' },
  ],
};

describe('Overview', () => {
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Overview],
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [
            { selector: selectDashboardOperationsViewModel, value: readyViewModel },
            { selector: selectOperationsAnalyticsData, value: null },
            { selector: selectOperationsLineOptions, value: readyViewModel.lines },
            { selector: selectDashboardFilters, value: DEFAULT_DASHBOARD_FILTERS },
          ],
        }),
      ],
    }).compileComponents();
    store = TestBed.inject(MockStore);
  });

  it('starts and stops the overview lifecycle through NgRx', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();

    expect(dispatch).toHaveBeenCalledWith(OperationsActions.enterOverview());

    fixture.destroy();
    expect(dispatch).toHaveBeenCalledWith(OperationsActions.leaveOverview());
  });

  it('presents the operational dashboard and contextual line links', () => {
    const fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const firstLine = element.querySelector<HTMLAnchorElement>('.process__stage');

    expect(element.querySelector('[data-testid="plant-name"]')?.textContent).toContain(
      'Planta Norte',
    );
    expect(element.querySelector('[data-testid="kpi-item"]')?.textContent).toContain('78.0%');
    expect(firstLine?.getAttribute('href')).toBe(
      '/lines/cutting-01?plant=plant-north&shift=morning&line=cutting-01',
    );
    expect(firstLine?.getAttribute('aria-label')).toBe('Ver detalle de Corte 01, estado Operativa');
  });

  it('presents an accessible loading state', () => {
    store.overrideSelector(selectDashboardOperationsViewModel, {
      ...readyViewModel,
      status: 'loading',
      plantName: null,
      location: null,
      lines: [],
      kpis: [],
    });
    const fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="status"]')?.textContent,
    ).toContain('Cargando');
  });

  it('presents retained data with a stale warning after refresh failure', () => {
    store.overrideSelector(selectDashboardOperationsViewModel, {
      ...readyViewModel,
      stale: true,
      error: 'No se pudo actualizar.',
    });
    const fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="stale-warning"]')
        ?.textContent,
    ).toContain('Datos desactualizados');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.process__stage')).toHaveLength(
      4,
    );
  });

  it('presents an explicit empty state', () => {
    store.overrideSelector(selectDashboardOperationsViewModel, {
      ...readyViewModel,
      status: 'empty',
      lines: [],
      kpis: [],
    });
    const fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="empty-state"]')
        ?.textContent,
    ).toContain('No hay líneas');
  });

  it('presents an accessible initial error state', () => {
    store.overrideSelector(selectDashboardOperationsViewModel, {
      ...readyViewModel,
      status: 'error',
      plantName: null,
      location: null,
      lines: [],
      kpis: [],
      error: 'No se pudo cargar el resumen de planta.',
    });
    const fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('No se pudo cargar');
  });
});
