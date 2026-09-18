import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { AlertFilters, IndustrialAlert } from '../models/alert.models';
import { AlertsActions } from './alerts.actions';

export const ALERTS_FEATURE_KEY = 'alerts';

export const DEFAULT_ALERT_FILTERS: AlertFilters = {
  severity: 'all',
  status: 'all',
  lineId: null,
};

export interface AlertsState extends EntityState<IndustrialAlert> {
  readonly loading: boolean;
  readonly loaded: boolean;
  readonly error: string | null;
  readonly generatedAt: string | null;
  readonly filters: AlertFilters;
}

export const alertsAdapter = createEntityAdapter<IndustrialAlert>();

export const initialAlertsState: AlertsState = alertsAdapter.getInitialState({
  loading: false,
  loaded: false,
  error: null,
  generatedAt: null,
  filters: DEFAULT_ALERT_FILTERS,
});

export const alertsReducer = createReducer(
  initialAlertsState,
  on(AlertsActions.load, (state): AlertsState =>
    alertsAdapter.removeAll({
      ...state,
      loading: true,
      loaded: false,
      error: null,
      generatedAt: null,
    }),
  ),
  on(AlertsActions.loadSuccess, (state, { response }): AlertsState =>
    alertsAdapter.setAll([...response.alerts], {
      ...state,
      loading: false,
      loaded: true,
      error: null,
      generatedAt: response.generatedAt,
    }),
  ),
  on(AlertsActions.loadFailure, (state, { error }): AlertsState => ({
    ...state,
    loading: false,
    loaded: false,
    error,
  })),
  on(AlertsActions.setFilters, (state, { filters }): AlertsState => ({ ...state, filters })),
);
