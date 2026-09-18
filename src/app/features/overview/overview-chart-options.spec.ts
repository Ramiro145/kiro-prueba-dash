import { EChartsCoreOption } from 'echarts/core';
import { OperationsAnalyticsData } from '../../domains/operations/state/operations.selectors';
import { createOverviewChartModels } from './overview-chart-options';

const analytics: OperationsAnalyticsData = {
  trend: [
    { timestamp: '2026-09-18T07:00:00.000Z', actual: 0.84, target: 0.85 },
    { timestamp: '2026-09-18T12:00:00.000Z', actual: 0.78, target: 0.85 },
  ],
  productionByHour: [
    { timestamp: '2026-09-18T07:00:00.000Z', actualUnits: 220, targetUnits: 300 },
    { timestamp: '2026-09-18T08:00:00.000Z', actualUnits: 245, targetUnits: 300 },
    { timestamp: '2026-09-18T09:00:00.000Z', actualUnits: 260, targetUnits: 300 },
    { timestamp: '2026-09-18T10:00:00.000Z', actualUnits: 275, targetUnits: 300 },
    { timestamp: '2026-09-18T11:00:00.000Z', actualUnits: 280, targetUnits: 325 },
    { timestamp: '2026-09-18T12:00:00.000Z', actualUnits: 282, targetUnits: 325 },
  ],
  downtimeByReason: [
    { reason: 'Ajuste de soldadura', durationMinutes: 58 },
    { reason: 'Cambio de herramienta', durationMinutes: 34 },
    { reason: 'Espera de material', durationMinutes: 25 },
    { reason: 'Inspección de calidad', durationMinutes: 18 },
  ],
};

interface DatasetOption {
  readonly source: readonly (readonly (string | number | null)[])[];
}

const datasetOf = (option: EChartsCoreOption): DatasetOption => option['dataset'] as DatasetOption;

describe('overview chart options', () => {
  it('builds an OEE trend with actual and target series plus a textual summary', () => {
    const charts = createOverviewChartModels(analytics);

    expect(datasetOf(charts.oee.option).source).toEqual([
      ['Hora', 'OEE', 'Meta'],
      ['07:00', 84, 85],
      ['12:00', 78, 85],
    ]);
    expect(charts.oee.summary).toContain('inició en 84.0%');
    expect(charts.oee.summary).toContain('finalizó en 78.0%');
  });

  it('builds hourly production and reports accumulated actual versus target', () => {
    const charts = createOverviewChartModels(analytics);

    expect(datasetOf(charts.production.option).source).toHaveLength(7);
    expect(charts.production.summary).toBe(
      'Producción acumulada: 1,562 unidades frente a una meta de 1,850.',
    );
  });

  it('does not reinterpret unknown production values as zero', () => {
    const charts = createOverviewChartModels({
      ...analytics,
      productionByHour: analytics.productionByHour.map((point) => ({
        ...point,
        actualUnits: null,
        targetUnits: null,
      })),
    });

    expect(charts.production.summary).toBe(
      'Producción horaria sin datos disponibles para el turno.',
    );
  });

  it('sorts downtime causes and describes the leading Pareto contributor', () => {
    const charts = createOverviewChartModels(analytics);
    const source = datasetOf(charts.downtime.option).source;

    expect(source[1]).toEqual(['Ajuste de soldadura', 58, 43]);
    expect(charts.downtime.summary).toBe(
      'Principal causa de paro: Ajuste de soldadura, 58 minutos, 43.0% del tiempo clasificado.',
    );
  });
});
