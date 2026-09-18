import { ALERTS_RESPONSE } from '../../../core/mock-api/alerts.fixtures';
import { DEFAULT_DASHBOARD_FILTERS } from '../../operations/state/dashboard-filters.selectors';
import { alertsAdapter, initialAlertsState } from './alerts.reducer';
import { selectAlertsViewModel, selectDashboardAlertsViewModel } from './alerts.selectors';

describe('alert selectors', () => {
  it('sorts critical alerts first and older alerts first within severity', () => {
    const state = alertsAdapter.setAll([...ALERTS_RESPONSE.alerts], {
      ...initialAlertsState,
      loaded: true,
      generatedAt: ALERTS_RESPONSE.generatedAt,
    });
    const viewModel = selectAlertsViewModel.projector(state);

    expect(viewModel.status).toBe('ready');
    expect(viewModel.alerts.slice(0, 2).map(({ id }) => id)).toEqual([
      'alert-critical-cutting',
      'alert-critical-welding',
    ]);
    expect(viewModel.activeCount).toBe(4);
    expect(viewModel.criticalCount).toBe(2);
    expect(viewModel.alerts.find(({ id }) => id === 'alert-critical-welding')?.durationLabel).toBe(
      '72 min',
    );
  });

  it('combines severity, status and line filters', () => {
    const state = alertsAdapter.setAll([...ALERTS_RESPONSE.alerts], {
      ...initialAlertsState,
      loaded: true,
      generatedAt: ALERTS_RESPONSE.generatedAt,
      filters: {
        severity: 'warning' as const,
        status: 'active' as const,
        lineId: 'forming-01',
      },
    });
    const viewModel = selectAlertsViewModel.projector(state);

    expect(viewModel.alerts.map(({ id }) => id)).toEqual(['alert-warning-forming']);
  });

  it('uses Router Store as the source of the line filter', () => {
    const state = alertsAdapter.setAll([...ALERTS_RESPONSE.alerts], {
      ...initialAlertsState,
      loaded: true,
      generatedAt: ALERTS_RESPONSE.generatedAt,
    });
    const baseViewModel = selectAlertsViewModel.projector(state);
    const viewModel = selectDashboardAlertsViewModel.projector(baseViewModel, {
      ...DEFAULT_DASHBOARD_FILTERS,
      lineId: 'welding-01',
    });

    expect(viewModel.filters.lineId).toBe('welding-01');
    expect(viewModel.alerts.map(({ id }) => id)).toEqual(['alert-critical-welding']);
  });

  it('returns empty and error presentation states explicitly', () => {
    expect(selectAlertsViewModel.projector({ ...initialAlertsState, loaded: true }).status).toBe(
      'empty',
    );
    expect(
      selectAlertsViewModel.projector({
        ...initialAlertsState,
        loaded: false,
        error: 'No disponible',
      }).status,
    ).toBe('error');
  });
});
