import { createFeatureSelector, createSelector } from '@ngrx/store';
import { selectDashboardFilters } from '../../operations/state/dashboard-filters.selectors';
import { AlertFilters, AlertSeverity, AlertStatus, IndustrialAlert } from '../models/alert.models';
import { ALERTS_FEATURE_KEY, AlertsState, alertsAdapter } from './alerts.reducer';

export type AlertsViewStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

export interface AlertRowViewModel {
  readonly id: string;
  readonly severity: AlertSeverity;
  readonly severityLabel: string;
  readonly status: AlertStatus;
  readonly statusLabel: string;
  readonly lineId: string;
  readonly lineName: string;
  readonly plantName: string;
  readonly message: string;
  readonly startedAt: string;
  readonly durationLabel: string;
}

export interface AlertsViewModel {
  readonly status: AlertsViewStatus;
  readonly loading: boolean;
  readonly error: string | null;
  readonly generatedAt: string | null;
  readonly totalCount: number;
  readonly activeCount: number;
  readonly criticalCount: number;
  readonly filters: AlertFilters;
  readonly lineOptions: readonly { id: string; name: string }[];
  readonly alerts: readonly AlertRowViewModel[];
}

const SEVERITY_RANK: Record<AlertSeverity, number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  critical: 'Crítica',
  warning: 'Preventiva',
  info: 'Informativa',
};

const STATUS_LABEL: Record<AlertStatus, string> = {
  active: 'Activa',
  resolved: 'Resuelta',
};

const hourFormatter = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
});

const matchesFilters = (alert: IndustrialAlert, filters: AlertFilters): boolean =>
  (filters.severity === 'all' || alert.severity === filters.severity) &&
  (filters.status === 'all' || alert.status === filters.status) &&
  (filters.lineId === null || alert.lineId === filters.lineId);

const durationMinutes = (alert: IndustrialAlert, generatedAt: string | null): number | null => {
  const end = alert.resolvedAt ?? generatedAt;
  if (!end) {
    return null;
  }
  const duration = Math.round(
    (new Date(end).getTime() - new Date(alert.startedAt).getTime()) / 60_000,
  );
  return Number.isFinite(duration) && duration >= 0 ? duration : null;
};

const toRow = (alert: IndustrialAlert, generatedAt: string | null): AlertRowViewModel => {
  const duration = durationMinutes(alert, generatedAt);
  return {
    id: alert.id,
    severity: alert.severity,
    severityLabel: SEVERITY_LABEL[alert.severity],
    status: alert.status,
    statusLabel: STATUS_LABEL[alert.status],
    lineId: alert.lineId,
    lineName: alert.lineName,
    plantName: alert.plantId === 'plant-north' ? 'Planta Norte' : alert.plantId,
    message: alert.message,
    startedAt: hourFormatter.format(new Date(alert.startedAt)),
    durationLabel: duration === null ? '—' : `${duration} min`,
  };
};

export const selectAlertsState = createFeatureSelector<AlertsState>(ALERTS_FEATURE_KEY);

export const selectAlertsViewModel = createSelector(selectAlertsState, (state): AlertsViewModel => {
  const all = alertsAdapter.getSelectors().selectAll(state);
  const filtered = all
    .filter((alert) => matchesFilters(alert, state.filters))
    .sort(
      (left, right) =>
        SEVERITY_RANK[right.severity] - SEVERITY_RANK[left.severity] ||
        left.startedAt.localeCompare(right.startedAt),
    );
  const status: AlertsViewStatus = state.error
    ? 'error'
    : state.loading && !state.loaded
      ? 'loading'
      : state.loaded && filtered.length === 0
        ? 'empty'
        : state.loaded
          ? 'ready'
          : 'idle';
  const uniqueLines = new Map<string, string>();
  all.forEach(({ lineId, lineName }) => uniqueLines.set(lineId, lineName));

  return {
    status,
    loading: state.loading,
    error: state.error,
    generatedAt: state.generatedAt,
    totalCount: all.length,
    activeCount: all.filter(({ status: alertStatus }) => alertStatus === 'active').length,
    criticalCount: all.filter(({ severity }) => severity === 'critical').length,
    filters: state.filters,
    lineOptions: [...uniqueLines]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    alerts: filtered.map((alert) => toRow(alert, state.generatedAt)),
  };
});

export const selectDashboardAlertsViewModel = createSelector(
  selectAlertsViewModel,
  selectDashboardFilters,
  (viewModel, dashboardFilters): AlertsViewModel => {
    const lineId = dashboardFilters.lineId;
    const alerts = lineId
      ? viewModel.alerts.filter((alert) => alert.lineId === lineId)
      : viewModel.alerts;
    const dataStatus = viewModel.status === 'ready' || viewModel.status === 'empty';

    return {
      ...viewModel,
      status: dataStatus ? (alerts.length > 0 ? 'ready' : 'empty') : viewModel.status,
      filters: { ...viewModel.filters, lineId },
      alerts,
    };
  },
);
