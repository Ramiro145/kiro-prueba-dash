import { EChartsCoreOption } from 'echarts/core';
import { OperationsAnalyticsData } from '../../domains/operations/state/operations.selectors';

export interface OverviewChartModel {
  readonly eyebrow: string;
  readonly title: string;
  readonly option: EChartsCoreOption;
  readonly summary: string;
}

export interface OverviewChartModels {
  readonly oee: OverviewChartModel;
  readonly production: OverviewChartModel;
  readonly downtime: OverviewChartModel;
}

const integerFormatter = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });
const hourFormatter = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
});

const hourOf = (timestamp: string): string => hourFormatter.format(new Date(timestamp));
const percentOf = (value: number | null): number | null =>
  value === null || !Number.isFinite(value) ? null : Number((value * 100).toFixed(1));

const commonOption = (summary: string): EChartsCoreOption => ({
  animation: false,
  aria: {
    enabled: true,
    decal: { show: true },
    description: summary,
  },
  textStyle: {
    color: '#52636b',
    fontFamily: 'IBM Plex Sans, Segoe UI, sans-serif',
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#182227',
    borderWidth: 0,
    textStyle: { color: '#ffffff' },
  },
});

const createOeeChart = (data: OperationsAnalyticsData): OverviewChartModel => {
  const validActuals = data.trend.filter(
    (point): point is typeof point & { actual: number } => point.actual !== null,
  );
  const first = validActuals[0]?.actual;
  const last = validActuals.at(-1)?.actual;
  const summary =
    first === undefined || last === undefined
      ? 'Tendencia OEE sin datos disponibles para el turno.'
      : `El OEE inició en ${(first * 100).toFixed(1)}% y finalizó en ${(last * 100).toFixed(1)}%; la meta es 85.0%.`;
  const source = [
    ['Hora', 'OEE', 'Meta'],
    ...data.trend.map((point) => [
      hourOf(point.timestamp),
      percentOf(point.actual),
      percentOf(point.target),
    ]),
  ];

  return {
    eyebrow: 'Eficiencia del turno',
    title: 'Tendencia OEE',
    summary,
    option: {
      ...commonOption(summary),
      dataset: { source },
      grid: { top: 42, right: 20, bottom: 34, left: 48 },
      legend: { top: 0, right: 0, itemWidth: 18, itemHeight: 4 },
      xAxis: {
        type: 'category',
        axisLine: { lineStyle: { color: '#a9b5bb' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 50,
        max: 100,
        axisLabel: { formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#dce3e6' } },
      },
      series: [
        {
          name: 'OEE',
          type: 'line',
          encode: { x: 'Hora', y: 'OEE' },
          symbol: 'circle',
          symbolSize: 7,
          lineStyle: { color: '#126782', width: 3 },
          itemStyle: { color: '#126782' },
        },
        {
          name: 'Meta',
          type: 'line',
          encode: { x: 'Hora', y: 'Meta' },
          symbol: 'none',
          lineStyle: { color: '#52636b', type: 'dashed', width: 2 },
        },
      ],
    },
  };
};

const createProductionChart = (data: OperationsAnalyticsData): OverviewChartModel => {
  const actualReadings = data.productionByHour
    .map((point) => point.actualUnits)
    .filter((value): value is number => value !== null);
  const targetReadings = data.productionByHour
    .map((point) => point.targetUnits)
    .filter((value): value is number => value !== null);
  const actual = actualReadings.reduce((total, value) => total + value, 0);
  const target = targetReadings.reduce((total, value) => total + value, 0);
  const hasActualData = actualReadings.length > 0;
  const hasTargetData = targetReadings.length > 0;
  const summary =
    hasActualData && hasTargetData
      ? `Producción acumulada: ${integerFormatter.format(actual)} unidades frente a una meta de ${integerFormatter.format(target)}.`
      : hasActualData
        ? `Producción acumulada: ${integerFormatter.format(actual)} unidades; meta no disponible.`
        : hasTargetData
          ? `Producción real no disponible; meta acumulada: ${integerFormatter.format(target)} unidades.`
          : 'Producción horaria sin datos disponibles para el turno.';
  const source = [
    ['Hora', 'Real', 'Meta'],
    ...data.productionByHour.map((point) => [
      hourOf(point.timestamp),
      point.actualUnits,
      point.targetUnits,
    ]),
  ];

  return {
    eyebrow: 'Ritmo de salida',
    title: 'Producción por hora',
    summary,
    option: {
      ...commonOption(summary),
      dataset: { source },
      grid: { top: 42, right: 20, bottom: 34, left: 48 },
      legend: { top: 0, right: 0, itemWidth: 18, itemHeight: 4 },
      xAxis: {
        type: 'category',
        axisLine: { lineStyle: { color: '#a9b5bb' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#dce3e6' } },
      },
      series: [
        {
          name: 'Real',
          type: 'bar',
          encode: { x: 'Hora', y: 'Real' },
          itemStyle: { color: '#126782' },
          barMaxWidth: 28,
        },
        {
          name: 'Meta',
          type: 'line',
          encode: { x: 'Hora', y: 'Meta' },
          symbol: 'none',
          lineStyle: { color: '#c77a10', width: 2 },
        },
      ],
    },
  };
};

const createDowntimeChart = (data: OperationsAnalyticsData): OverviewChartModel => {
  const sorted = [...data.downtimeByReason].sort(
    (left, right) => right.durationMinutes - left.durationMinutes,
  );
  const total = sorted.reduce((sum, item) => sum + item.durationMinutes, 0);
  let cumulative = 0;
  const source = [
    ['Causa', 'Minutos', 'Acumulado'],
    ...sorted.map((item) => {
      cumulative += item.durationMinutes;
      return [
        item.reason,
        item.durationMinutes,
        total > 0 ? Math.round((cumulative / total) * 100) : 0,
      ];
    }),
  ];
  const leading = sorted[0];
  const leadingShare = leading && total > 0 ? (leading.durationMinutes / total) * 100 : null;
  const summary =
    leading && leadingShare !== null
      ? `Principal causa de paro: ${leading.reason}, ${integerFormatter.format(leading.durationMinutes)} minutos, ${leadingShare.toFixed(1)}% del tiempo clasificado.`
      : 'Causas de paro sin datos disponibles para el turno.';

  return {
    eyebrow: 'Pérdidas operativas',
    title: 'Pareto de paros',
    summary,
    option: {
      ...commonOption(summary),
      dataset: { source },
      grid: { top: 42, right: 48, bottom: 30, left: 142 },
      legend: { top: 0, right: 0, itemWidth: 18, itemHeight: 4 },
      xAxis: [
        {
          type: 'value',
          name: 'min',
          splitLine: { lineStyle: { color: '#dce3e6' } },
        },
        {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: { formatter: '{value}%' },
          splitLine: { show: false },
        },
      ],
      yAxis: {
        type: 'category',
        inverse: true,
        axisLine: { lineStyle: { color: '#a9b5bb' } },
        axisTick: { show: false },
      },
      series: [
        {
          name: 'Minutos',
          type: 'bar',
          encode: { x: 'Minutos', y: 'Causa' },
          itemStyle: { color: '#b33b3b' },
          barMaxWidth: 24,
        },
        {
          name: 'Acumulado',
          type: 'line',
          xAxisIndex: 1,
          encode: { x: 'Acumulado', y: 'Causa' },
          symbolSize: 6,
          lineStyle: { color: '#182227', width: 2 },
          itemStyle: { color: '#182227' },
        },
      ],
    },
  };
};

export const createOverviewChartModels = (data: OperationsAnalyticsData): OverviewChartModels => ({
  oee: createOeeChart(data),
  production: createProductionChart(data),
  downtime: createDowntimeChart(data),
});
