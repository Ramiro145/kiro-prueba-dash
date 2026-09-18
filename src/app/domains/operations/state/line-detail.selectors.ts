import { getRouterSelectors } from '@ngrx/router-store';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LineStage, LineStatus } from '../models/operations.models';
import { selectDashboardFilters } from './dashboard-filters.selectors';
import { LINE_DETAIL_FEATURE_KEY, LineDetailState } from './line-detail.reducer';
import { OperationsKpiViewModel, createKpis } from './operations.selectors';

const { selectRouteParam } = getRouterSelectors();
const selectLineId = selectRouteParam('lineId');

export interface LineDetailContext {
  readonly lineId: string;
  readonly plantId: string;
  readonly shiftId: string;
}

export type LineDetailViewStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'notFound' | 'error';

export interface LineDetailViewModel {
  readonly status: LineDetailViewStatus;
  readonly lineName: string | null;
  readonly stageName: string | null;
  readonly lineStatus: LineStatus | null;
  readonly statusLabel: string | null;
  readonly activeOrder: string | null;
  readonly shiftName: string | null;
  readonly updatedAt: string | null;
  readonly error: string | null;
  readonly kpis: readonly OperationsKpiViewModel[];
  readonly productionByHour: readonly { hour: string; actual: string; target: string }[];
  readonly statusTimeline: readonly {
    status: LineStatus;
    statusLabel: string;
    startedAt: string;
    endedAt: string;
  }[];
  readonly downtimeEvents: readonly {
    id: string;
    reason: string;
    startedAt: string;
    durationLabel: string;
  }[];
  readonly qualityDefects: readonly {
    category: string;
    count: number;
    percentageLabel: string;
  }[];
  readonly events: readonly { id: string; timestamp: string; message: string }[];
}

const STAGE_NAMES: Record<LineStage, string> = {
  cutting: 'Corte',
  forming: 'Conformado',
  welding: 'Soldadura',
  finishing: 'Acabado',
};

const STATUS_NAMES: Record<LineStatus, string> = {
  operational: 'Operativa',
  reduced: 'Rendimiento reducido',
  stopped: 'Parada',
  noData: 'Sin datos',
};

const integerFormatter = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });
const hourFormatter = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
});
const hourOf = (value: string): string => hourFormatter.format(new Date(value));
const integerOf = (value: number | null): string =>
  value === null ? '—' : integerFormatter.format(value);

export const selectLineDetailState =
  createFeatureSelector<LineDetailState>(LINE_DETAIL_FEATURE_KEY);

export const selectLineDetailContext = createSelector(
  selectLineId,
  selectDashboardFilters,
  (lineId, filters): LineDetailContext | null =>
    lineId
      ? {
          lineId,
          plantId: filters.plantId,
          shiftId: filters.shiftId,
        }
      : null,
);

export const selectLineDetailViewModel = createSelector(
  selectLineDetailState,
  (state): LineDetailViewModel => {
    const detail = state.data;
    const hasNoOperationalData =
      detail !== null &&
      Object.values(detail.metrics).every((value) => value === null) &&
      detail.snapshot.producedUnits === null &&
      detail.snapshot.targetUnits === null &&
      detail.productionByHour.every(
        ({ actualUnits, targetUnits }) => actualUnits === null && targetUnits === null,
      ) &&
      detail.statusTimeline.every(({ status }) => status === 'noData') &&
      detail.downtimeEvents.length === 0 &&
      detail.qualityDefects.length === 0 &&
      detail.events.length === 0;
    const status: LineDetailViewStatus = detail
      ? hasNoOperationalData
        ? 'empty'
        : 'ready'
      : state.loading
        ? 'loading'
        : state.errorKind === 'notFound'
          ? 'notFound'
          : state.error
            ? 'error'
            : 'idle';

    return {
      status,
      lineName: detail?.line.name ?? null,
      stageName: detail ? STAGE_NAMES[detail.line.stage] : null,
      lineStatus: detail?.line.status ?? null,
      statusLabel: detail ? STATUS_NAMES[detail.line.status] : null,
      activeOrder: detail?.line.activeOrder ?? null,
      shiftName: detail?.shift.name ?? null,
      updatedAt: detail?.updatedAt ?? null,
      error: state.error,
      kpis: detail ? createKpis(detail) : [],
      productionByHour:
        detail?.productionByHour.map((point) => ({
          hour: hourOf(point.timestamp),
          actual: integerOf(point.actualUnits),
          target: integerOf(point.targetUnits),
        })) ?? [],
      statusTimeline:
        detail?.statusTimeline.map((interval) => ({
          status: interval.status,
          statusLabel: STATUS_NAMES[interval.status],
          startedAt: hourOf(interval.startedAt),
          endedAt: interval.endedAt ? hourOf(interval.endedAt) : 'En curso',
        })) ?? [],
      downtimeEvents:
        detail?.downtimeEvents.map((event) => ({
          id: event.id,
          reason: event.reason,
          startedAt: hourOf(event.startedAt),
          durationLabel: event.durationMinutes === null ? '—' : `${event.durationMinutes} min`,
        })) ?? [],
      qualityDefects:
        detail?.qualityDefects.map((defect) => ({
          category: defect.category,
          count: defect.count,
          percentageLabel:
            defect.percentage === null ? '—' : `${(defect.percentage * 100).toFixed(1)}%`,
        })) ?? [],
      events:
        detail?.events.map((event) => ({
          id: event.id,
          timestamp: hourOf(event.timestamp),
          message: event.message,
        })) ?? [],
    };
  },
);
