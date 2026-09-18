import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { vi } from 'vitest';
import { AlertsActions } from '../../domains/alerts/state/alerts.actions';
import {
  AlertsViewModel,
  selectAlertsViewModel,
} from '../../domains/alerts/state/alerts.selectors';
import {
  DEFAULT_DASHBOARD_FILTERS,
  selectDashboardFilters,
} from '../../domains/operations/state/dashboard-filters.selectors';
import { Alerts } from './alerts';

const readyViewModel: AlertsViewModel = {
  status: 'ready',
  loading: false,
  error: null,
  generatedAt: '2026-09-18T12:00:00.000Z',
  totalCount: 6,
  activeCount: 4,
  criticalCount: 2,
  filters: { severity: 'all', status: 'all', lineId: null },
  lineOptions: [
    { id: 'forming-01', name: 'Conformado 01' },
    { id: 'welding-01', name: 'Soldadura 01' },
  ],
  alerts: [
    {
      id: 'alert-critical-welding',
      severity: 'critical',
      severityLabel: 'Crítica',
      status: 'active',
      statusLabel: 'Activa',
      lineId: 'welding-01',
      lineName: 'Soldadura 01',
      message: 'Temperatura fuera de rango',
      startedAt: '10:48',
      durationLabel: '72 min',
    },
  ],
};

describe('Alerts', () => {
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alerts],
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [
            { selector: selectAlertsViewModel, value: readyViewModel },
            { selector: selectDashboardFilters, value: DEFAULT_DASHBOARD_FILTERS },
          ],
        }),
      ],
    }).compileComponents();
    store = TestBed.inject(MockStore);
  });

  it('loads and presents operational alerts', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(Alerts);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(dispatch).toHaveBeenCalledWith(
      AlertsActions.load({ plantId: 'plant-north', shiftId: 'morning' }),
    );
    expect(element.querySelector('h1')?.textContent).toContain('Centro de alertas');
    expect(element.textContent).toContain('Temperatura fuera de rango');
    expect(element.textContent).toContain('4 activas');
  });

  it('dispatches combined filters and links to the affected line', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(Alerts);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const severity = element.querySelector<HTMLSelectElement>('[data-testid="severity-filter"]');
    const link = element.querySelector<HTMLAnchorElement>('[data-testid="alert-line-link"]');

    severity!.value = 'critical';
    severity!.dispatchEvent(new Event('change'));

    expect(dispatch).toHaveBeenCalledWith(
      AlertsActions.setFilters({
        filters: { severity: 'critical', status: 'all', lineId: null },
      }),
    );
    expect(link?.getAttribute('href')).toBe(
      '/lines/welding-01?plant=plant-north&shift=morning&line=welding-01',
    );
  });

  it('renders empty and error states', () => {
    store.overrideSelector(selectAlertsViewModel, {
      ...readyViewModel,
      status: 'empty',
      alerts: [],
    });
    const emptyFixture = TestBed.createComponent(Alerts);
    emptyFixture.detectChanges();
    expect((emptyFixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay alertas para estos filtros',
    );

    store.overrideSelector(selectAlertsViewModel, {
      ...readyViewModel,
      status: 'error',
      alerts: [],
      error: 'No se pudieron cargar las alertas.',
    });
    const errorFixture = TestBed.createComponent(Alerts);
    errorFixture.detectChanges();
    expect(
      (errorFixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('No se pudieron cargar');
  });
});
