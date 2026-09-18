export type LineStage = 'cutting' | 'forming' | 'welding' | 'finishing';
export type LineStatus = 'operational' | 'reduced' | 'stopped' | 'noData';

export interface Plant {
  readonly id: string;
  readonly name: string;
  readonly location: string;
  readonly lineIds: readonly string[];
}

export interface ProductionLine {
  readonly id: string;
  readonly plantId: string;
  readonly name: string;
  readonly stage: LineStage;
  readonly status: LineStatus;
  readonly activeOrder: string | null;
}

export interface Shift {
  readonly id: string;
  readonly name: string;
  readonly startTime: string;
  readonly endTime: string;
}

export interface ProductionReading {
  readonly timestamp: string;
  readonly producedUnits: number | null;
  readonly targetUnits: number | null;
  readonly goodUnits: number | null;
  readonly scrapUnits: number | null;
  readonly plannedMinutes: number | null;
  readonly operatingMinutes: number | null;
  readonly downtimeMinutes: number | null;
}

export interface ProductionSnapshot extends ProductionReading {
  readonly lineId: string;
}

export type PlantProductionSnapshot = ProductionReading;

export interface OeeMetrics {
  readonly oee: number | null;
  readonly availability: number | null;
  readonly performance: number | null;
  readonly quality: number | null;
}

export interface TrendPoint {
  readonly timestamp: string;
  readonly actual: number | null;
  readonly target: number | null;
}

export interface DowntimeEvent {
  readonly id: string;
  readonly lineId: string;
  readonly reason: string;
  readonly startedAt: string;
  readonly endedAt: string | null;
  readonly durationMinutes: number | null;
}

export interface DowntimeReasonTotal {
  readonly reason: string;
  readonly durationMinutes: number;
}

export interface QualityDefect {
  readonly category: string;
  readonly count: number;
  readonly percentage: number | null;
}

export interface LineOverview extends ProductionLine {
  readonly metrics: OeeMetrics;
  readonly snapshot: ProductionSnapshot;
}

export interface PlantOverview {
  readonly plant: Plant;
  readonly shift: Shift;
  readonly lines: readonly LineOverview[];
  readonly metrics: OeeMetrics;
  readonly snapshot: PlantProductionSnapshot;
  readonly trend: readonly TrendPoint[];
  readonly downtimeByReason: readonly DowntimeReasonTotal[];
  readonly qualityDefects: readonly QualityDefect[];
  readonly activeAlertCount: number;
  readonly updatedAt: string;
}
