import { AlertsResponse } from '../../domains/alerts/models/alert.models';
import {
  LineDetailData,
  PlantOverview,
  Shift,
} from '../../domains/operations/models/operations.models';

const SHIFT_OFFSETS: Record<string, number> = {
  morning: 0,
  afternoon: 8,
  night: 16,
};

const shiftTimestamp = (timestamp: string, shiftId: string): string => {
  const date = new Date(timestamp);
  date.setUTCHours(date.getUTCHours() + (SHIFT_OFFSETS[shiftId] ?? 0));
  return date.toISOString();
};

export const overviewForShift = (overview: PlantOverview, shift: Shift): PlantOverview => ({
  ...overview,
  shift,
  updatedAt: shiftTimestamp(overview.updatedAt, shift.id),
  snapshot: {
    ...overview.snapshot,
    timestamp: shiftTimestamp(overview.snapshot.timestamp, shift.id),
  },
  lines: overview.lines.map((line) => ({
    ...line,
    snapshot: {
      ...line.snapshot,
      timestamp: shiftTimestamp(line.snapshot.timestamp, shift.id),
    },
  })),
  trend: overview.trend.map((point) => ({
    ...point,
    timestamp: shiftTimestamp(point.timestamp, shift.id),
  })),
  productionByHour: overview.productionByHour.map((point) => ({
    ...point,
    timestamp: shiftTimestamp(point.timestamp, shift.id),
  })),
});

export const lineDetailForShift = (detail: LineDetailData, shift: Shift): LineDetailData => ({
  ...detail,
  shift,
  updatedAt: shiftTimestamp(detail.updatedAt, shift.id),
  snapshot: {
    ...detail.snapshot,
    timestamp: shiftTimestamp(detail.snapshot.timestamp, shift.id),
  },
  productionByHour: detail.productionByHour.map((point) => ({
    ...point,
    timestamp: shiftTimestamp(point.timestamp, shift.id),
  })),
  statusTimeline: detail.statusTimeline.map((interval) => ({
    ...interval,
    startedAt: shiftTimestamp(interval.startedAt, shift.id),
    endedAt: interval.endedAt ? shiftTimestamp(interval.endedAt, shift.id) : null,
  })),
  downtimeEvents: detail.downtimeEvents.map((event) => ({
    ...event,
    startedAt: shiftTimestamp(event.startedAt, shift.id),
    endedAt: event.endedAt ? shiftTimestamp(event.endedAt, shift.id) : null,
  })),
  events: detail.events.map((event) => ({
    ...event,
    timestamp: shiftTimestamp(event.timestamp, shift.id),
  })),
});

export const alertsForShift = (response: AlertsResponse, shift: Shift): AlertsResponse => ({
  generatedAt: shiftTimestamp(response.generatedAt, shift.id),
  alerts: response.alerts.map((alert) => ({
    ...alert,
    startedAt: shiftTimestamp(alert.startedAt, shift.id),
    resolvedAt: alert.resolvedAt ? shiftTimestamp(alert.resolvedAt, shift.id) : null,
  })),
});
