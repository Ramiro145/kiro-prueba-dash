export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'active' | 'resolved';

export interface IndustrialAlert {
  readonly id: string;
  readonly plantId: string;
  readonly lineId: string;
  readonly lineName: string;
  readonly severity: AlertSeverity;
  readonly status: AlertStatus;
  readonly message: string;
  readonly startedAt: string;
  readonly resolvedAt: string | null;
}

export interface AlertsResponse {
  readonly alerts: readonly IndustrialAlert[];
  readonly generatedAt: string;
}

export type AlertSeverityFilter = AlertSeverity | 'all';
export type AlertStatusFilter = AlertStatus | 'all';

export interface AlertFilters {
  readonly severity: AlertSeverityFilter;
  readonly status: AlertStatusFilter;
  readonly lineId: string | null;
}
