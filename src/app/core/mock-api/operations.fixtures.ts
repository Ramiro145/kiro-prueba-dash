import {
  LineOverview,
  OeeMetrics,
  Plant,
  PlantOverview,
  PlantProductionSnapshot,
  ProductionSnapshot,
} from '../../domains/operations/models/operations.models';

const UPDATED_AT = '2026-09-18T12:00:00.000Z';

export const PLANTS: readonly Plant[] = [
  {
    id: 'plant-north',
    name: 'Planta Norte',
    location: 'Monterrey, NL',
    lineIds: ['cutting-01', 'forming-01', 'welding-01', 'finishing-01'],
  },
];

const metrics = (
  oee: number | null,
  availability: number | null,
  performance: number | null,
  quality: number | null,
): OeeMetrics => ({ oee, availability, performance, quality });

const productionReading = (
  producedUnits: number | null,
  targetUnits: number | null,
  goodUnits: number | null,
  scrapUnits: number | null,
  downtimeMinutes: number | null,
): PlantProductionSnapshot => ({
  timestamp: UPDATED_AT,
  producedUnits,
  targetUnits,
  goodUnits,
  scrapUnits,
  plannedMinutes: 240,
  operatingMinutes: downtimeMinutes === null ? null : Math.max(0, 240 - downtimeMinutes),
  downtimeMinutes,
});

const lineSnapshot = (
  lineId: string,
  producedUnits: number | null,
  targetUnits: number | null,
  goodUnits: number | null,
  scrapUnits: number | null,
  downtimeMinutes: number | null,
): ProductionSnapshot => ({
  lineId,
  ...productionReading(producedUnits, targetUnits, goodUnits, scrapUnits, downtimeMinutes),
});

const LINES: readonly LineOverview[] = [
  {
    id: 'cutting-01',
    plantId: 'plant-north',
    name: 'Corte 01',
    stage: 'cutting',
    status: 'operational',
    activeOrder: 'OT-260918-041',
    metrics: metrics(0.89, 0.94, 0.96, 0.99),
    snapshot: lineSnapshot('cutting-01', 612, 640, 606, 6, 14),
  },
  {
    id: 'forming-01',
    plantId: 'plant-north',
    name: 'Conformado 01',
    stage: 'forming',
    status: 'reduced',
    activeOrder: 'OT-260918-039',
    metrics: metrics(0.74, 0.82, 0.92, 0.98),
    snapshot: lineSnapshot('forming-01', 534, 620, 523, 11, 43),
  },
  {
    id: 'welding-01',
    plantId: 'plant-north',
    name: 'Soldadura 01',
    stage: 'welding',
    status: 'stopped',
    activeOrder: 'OT-260918-037',
    metrics: metrics(0.61, 0.67, 0.94, 0.97),
    snapshot: lineSnapshot('welding-01', 416, 590, 404, 12, 78),
  },
  {
    id: 'finishing-01',
    plantId: 'plant-north',
    name: 'Acabado 01',
    stage: 'finishing',
    status: 'noData',
    activeOrder: null,
    metrics: metrics(null, null, null, null),
    snapshot: lineSnapshot('finishing-01', null, null, null, null, null),
  },
];

export const NORTH_PLANT_OVERVIEW: PlantOverview = {
  plant: PLANTS[0],
  shift: {
    id: 'morning',
    name: 'Turno mañana',
    startTime: '06:00',
    endTime: '14:00',
  },
  lines: LINES,
  metrics: metrics(0.78, 0.84, 0.95, 0.98),
  snapshot: productionReading(1562, 1850, 1533, 29, 135),
  trend: [
    { timestamp: '2026-09-18T07:00:00.000Z', actual: 0.84, target: 0.85 },
    { timestamp: '2026-09-18T08:00:00.000Z', actual: 0.82, target: 0.85 },
    { timestamp: '2026-09-18T09:00:00.000Z', actual: 0.8, target: 0.85 },
    { timestamp: '2026-09-18T10:00:00.000Z', actual: 0.75, target: 0.85 },
    { timestamp: '2026-09-18T11:00:00.000Z', actual: 0.78, target: 0.85 },
    { timestamp: UPDATED_AT, actual: 0.78, target: 0.85 },
  ],
  downtimeByReason: [
    { reason: 'Ajuste de soldadura', durationMinutes: 58 },
    { reason: 'Cambio de herramienta', durationMinutes: 34 },
    { reason: 'Espera de material', durationMinutes: 25 },
    { reason: 'Inspección de calidad', durationMinutes: 18 },
  ],
  qualityDefects: [
    { category: 'Cordón irregular', count: 12, percentage: 0.41 },
    { category: 'Rebaba', count: 9, percentage: 0.31 },
    { category: 'Desalineación', count: 8, percentage: 0.28 },
  ],
  activeAlertCount: 3,
  updatedAt: UPDATED_AT,
};
