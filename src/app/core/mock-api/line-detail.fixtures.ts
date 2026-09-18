import {
  LineDetailData,
  LineOverview,
  Shift,
} from '../../domains/operations/models/operations.models';
import { NORTH_PLANT_OVERVIEW } from './operations.fixtures';

const UPDATED_AT = '2026-09-18T12:00:00.000Z';
const lineById = (lineId: string): LineOverview | undefined =>
  NORTH_PLANT_OVERVIEW.lines.find(({ id }) => id === lineId);

const hourlyProduction = (line: LineOverview) => {
  if (line.id === 'welding-01') {
    return [
      { timestamp: '2026-09-18T07:00:00.000Z', actualUnits: 52, targetUnits: 90 },
      { timestamp: '2026-09-18T08:00:00.000Z', actualUnits: 62, targetUnits: 95 },
      { timestamp: '2026-09-18T09:00:00.000Z', actualUnits: 70, targetUnits: 100 },
      { timestamp: '2026-09-18T10:00:00.000Z', actualUnits: 75, targetUnits: 100 },
      { timestamp: '2026-09-18T11:00:00.000Z', actualUnits: 77, targetUnits: 100 },
      { timestamp: UPDATED_AT, actualUnits: 80, targetUnits: 105 },
    ];
  }

  const produced = line.snapshot.producedUnits;
  const target = line.snapshot.targetUnits;
  return Array.from({ length: 6 }, (_, index) => ({
    timestamp: `2026-09-18T${String(index + 7).padStart(2, '0')}:00:00.000Z`,
    actualUnits: produced === null ? null : Math.round(produced / 6),
    targetUnits: target === null ? null : Math.round(target / 6),
  }));
};

export const createLineDetailFixture = (lineId: string, shift: Shift): LineDetailData | null => {
  const line = lineById(lineId);
  if (!line) {
    return null;
  }

  const isWelding = line.id === 'welding-01';
  return {
    line,
    shift,
    metrics: line.metrics,
    snapshot: line.snapshot,
    productionByHour: hourlyProduction(line),
    statusTimeline: isWelding
      ? [
          {
            status: 'operational',
            startedAt: '2026-09-18T06:00:00.000Z',
            endedAt: '2026-09-18T09:32:00.000Z',
          },
          {
            status: 'reduced',
            startedAt: '2026-09-18T09:32:00.000Z',
            endedAt: '2026-09-18T10:48:00.000Z',
          },
          {
            status: 'stopped',
            startedAt: '2026-09-18T10:48:00.000Z',
            endedAt: null,
          },
        ]
      : [
          {
            status: line.status,
            startedAt: '2026-09-18T06:00:00.000Z',
            endedAt: null,
          },
        ],
    downtimeEvents: isWelding
      ? [
          {
            id: 'down-welding-01',
            lineId: line.id,
            reason: 'Ajuste de soldadura',
            startedAt: '2026-09-18T10:48:00.000Z',
            endedAt: null,
            durationMinutes: 58,
          },
          {
            id: 'down-welding-02',
            lineId: line.id,
            reason: 'Cambio de consumible',
            startedAt: '2026-09-18T08:25:00.000Z',
            endedAt: '2026-09-18T08:37:00.000Z',
            durationMinutes: 12,
          },
        ]
      : [],
    qualityDefects: isWelding
      ? [
          { category: 'Cordón irregular', count: 12, percentage: 0.41 },
          { category: 'Porosidad', count: 9, percentage: 0.31 },
          { category: 'Desalineación', count: 8, percentage: 0.28 },
        ]
      : [],
    events: isWelding
      ? [
          {
            id: 'event-welding-01',
            timestamp: '2026-09-18T10:48:00.000Z',
            message: 'Paro por ajuste de soldadura',
          },
          {
            id: 'event-welding-02',
            timestamp: '2026-09-18T09:32:00.000Z',
            message: 'Velocidad reducida por inspección',
          },
          {
            id: 'event-welding-03',
            timestamp: '2026-09-18T08:37:00.000Z',
            message: 'Producción reanudada',
          },
        ]
      : [],
    updatedAt: UPDATED_AT,
  };
};

export const WELDING_LINE_DETAIL = createLineDetailFixture(
  'welding-01',
  NORTH_PLANT_OVERVIEW.shift,
)!;
