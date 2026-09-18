import { ALERTS_RESPONSE } from '../../../core/mock-api/alerts.fixtures';
import { AlertsActions } from './alerts.actions';
import { alertsAdapter, alertsReducer, initialAlertsState } from './alerts.reducer';

describe('alertsReducer', () => {
  it('normalizes a successful alert response with NgRx Entity', () => {
    const state = alertsReducer(
      { ...initialAlertsState, loading: true },
      AlertsActions.loadSuccess({ response: ALERTS_RESPONSE }),
    );
    const all = alertsAdapter.getSelectors().selectAll(state);

    expect(all).toHaveLength(ALERTS_RESPONSE.alerts.length);
    expect(state.ids).toContain('alert-critical-welding');
    expect(state.generatedAt).toBe(ALERTS_RESPONSE.generatedAt);
    expect(state.loaded).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('changes filters without dropping normalized entities', () => {
    const loaded = alertsAdapter.setAll([...ALERTS_RESPONSE.alerts], initialAlertsState);
    const state = alertsReducer(
      loaded,
      AlertsActions.setFilters({
        filters: { severity: 'critical', status: 'active', lineId: 'welding-01' },
      }),
    );

    expect(state.ids).toHaveLength(ALERTS_RESPONSE.alerts.length);
    expect(state.filters).toEqual({
      severity: 'critical',
      status: 'active',
      lineId: 'welding-01',
    });
  });
});
