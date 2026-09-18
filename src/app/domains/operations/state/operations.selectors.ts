import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LineStage, LineStatus, PlantOverview } from '../models/operations.models';
import { OPERATIONS_FEATURE_KEY, OperationsState } from './operations.reducer';
import { selectDashboardFilters } from './dashboard-filters.selectors';

export type OperationsViewStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error';
export type OperationsKpiTone = 'neutral' | 'positive' | 'warning' | 'critical';

export interface OperationsLineViewModel {
  readonly id: string;
  readonly name: string;
  readonly stageName: string;
  readonly status: LineStatus;
}

export interface OperationsKpiViewModel {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly supportingText: string;
  readonly tone: OperationsKpiTone;
}

export interface OperationsViewModel {
  readonly status: OperationsViewStatus;
  readonly refreshing: boolean;
  readonly stale: boolean;
  readonly plantName: string | null;
  readonly location: string | null;
  readonly shiftName: string | null;
  readonly updatedAt: string | null;
  readonly error: string | null;
  readonly lines: readonly OperationsLineViewModel[];
  readonly kpis: readonly OperationsKpiViewModel[];
}

const STAGE_NAMES: Record<LineStage, string> = {
  cutting: 'Corte',
  forming: 'Conformado',
  welding: 'Soldadura',
  finishing: 'Acabado',
};

const integerFormatter = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 0,
});

const formatPercent = (value: number | null): string =>
  value === null || !Number.isFinite(value) ? '—' : `${(value * 100).toFixed(1)}%`;

const formatInteger = (value: number | null): string =>
  value === null || !Number.isFinite(value) ? '—' : integerFormatter.format(value);

const safeRatio = (numerator: number | null, denominator: number | null): number | null =>
  numerator === null || denominator === null || denominator <= 0 ? null : numerator / denominator;

const performanceTone = (
  value: number | null,
  positiveThreshold: number,
  warningThreshold: number,
): OperationsKpiTone => {
  if (value === null || !Number.isFinite(value)) {
    return 'neutral';
  }
  if (value >= positiveThreshold) {
    return 'positive';
  }
  return value >= warningThreshold ? 'warning' : 'critical';
};

export const createKpis = (
  overview: Pick<PlantOverview, 'metrics' | 'snapshot'>,
): readonly OperationsKpiViewModel[] => {
  const { metrics, snapshot } = overview;
  const productionRatio = safeRatio(snapshot.producedUnits, snapshot.targetUnits);
  const scrapRatio = safeRatio(snapshot.scrapUnits, snapshot.producedUnits);
  const productionValue =
    snapshot.producedUnits === null && snapshot.targetUnits === null
      ? '—'
      : `${formatInteger(snapshot.producedUnits)} / ${formatInteger(snapshot.targetUnits)}`;

  return [
    {
      id: 'oee',
      label: 'OEE',
      value: formatPercent(metrics.oee),
      supportingText: 'Meta ≥ 85.0%',
      tone: performanceTone(metrics.oee, 0.85, 0.7),
    },
    {
      id: 'availability',
      label: 'Disponibilidad',
      value: formatPercent(metrics.availability),
      supportingText: 'Tiempo operativo',
      tone: performanceTone(metrics.availability, 0.9, 0.8),
    },
    {
      id: 'performance',
      label: 'Rendimiento',
      value: formatPercent(metrics.performance),
      supportingText: 'Velocidad efectiva',
      tone: performanceTone(metrics.performance, 0.95, 0.85),
    },
    {
      id: 'quality',
      label: 'Calidad',
      value: formatPercent(metrics.quality),
      supportingText: 'Unidades conformes',
      tone: performanceTone(metrics.quality, 0.98, 0.95),
    },
    {
      id: 'production',
      label: 'Producción',
      value: productionValue,
      supportingText:
        productionRatio === null
          ? 'Meta no disponible'
          : `${formatPercent(productionRatio)} de meta`,
      tone: performanceTone(productionRatio, 1, 0.8),
    },
    {
      id: 'scrap',
      label: 'Scrap',
      value: formatPercent(scrapRatio),
      supportingText: 'Sobre producción total',
      tone:
        scrapRatio === null
          ? 'neutral'
          : scrapRatio <= 0.02
            ? 'positive'
            : scrapRatio <= 0.04
              ? 'warning'
              : 'critical',
    },
    {
      id: 'downtime',
      label: 'Tiempo de paro',
      value:
        snapshot.downtimeMinutes === null ? '—' : `${formatInteger(snapshot.downtimeMinutes)} min`,
      supportingText: 'Acumulado del turno',
      tone:
        snapshot.downtimeMinutes === null
          ? 'neutral'
          : snapshot.downtimeMinutes <= 30
            ? 'positive'
            : snapshot.downtimeMinutes <= 90
              ? 'warning'
              : 'critical',
    },
  ];
};

export const selectOperationsState = createFeatureSelector<OperationsState>(OPERATIONS_FEATURE_KEY);

export const selectOperationsViewModel = createSelector(
  selectOperationsState,
  (state): OperationsViewModel => {
    const status: OperationsViewStatus = state.data
      ? state.data.lines.length > 0
        ? 'ready'
        : 'empty'
      : state.loading
        ? 'loading'
        : state.error
          ? 'error'
          : 'idle';

    return {
      status,
      refreshing: state.refreshing,
      stale: state.stale,
      plantName: state.data?.plant.name ?? null,
      location: state.data?.plant.location ?? null,
      shiftName: state.data?.shift.name ?? null,
      updatedAt: state.lastUpdated,
      error: state.error,
      lines:
        state.data?.lines.map((line) => ({
          id: line.id,
          name: line.name,
          stageName: STAGE_NAMES[line.stage],
          status: line.status,
        })) ?? [],
      kpis: state.data ? createKpis(state.data) : [],
    };
  },
);

export const selectOperationsLineOptions = createSelector(
  selectOperationsState,
  (state) => state?.data?.lines.map(({ id, name }) => ({ id, name })) ?? [],
);

export const selectDashboardOperationsViewModel = createSelector(
  selectOperationsViewModel,
  selectOperationsState,
  selectDashboardFilters,
  (viewModel, state, filters): OperationsViewModel => {
    if (!filters.lineId || !state?.data) {
      return viewModel;
    }

    const line = state.data.lines.find(({ id }) => id === filters.lineId);
    const lineViewModel = viewModel.lines.find(({ id }) => id === filters.lineId);
    if (!line || !lineViewModel) {
      return { ...viewModel, status: 'empty', lines: [], kpis: [] };
    }

    return {
      ...viewModel,
      lines: [lineViewModel],
      kpis: createKpis({
        ...state.data,
        metrics: line.metrics,
        snapshot: line.snapshot,
      }),
    };
  },
);

export interface OperationsAnalyticsData {
  readonly trend: PlantOverview['trend'];
  readonly productionByHour: PlantOverview['productionByHour'];
  readonly downtimeByReason: PlantOverview['downtimeByReason'];
}

export const selectOperationsAnalyticsData = createSelector(
  selectOperationsState,
  (state): OperationsAnalyticsData | null =>
    state?.data
      ? {
          trend: state.data.trend,
          productionByHour: state.data.productionByHour,
          downtimeByReason: state.data.downtimeByReason,
        }
      : null,
);
