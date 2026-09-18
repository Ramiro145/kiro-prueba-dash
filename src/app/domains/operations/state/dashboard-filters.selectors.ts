import { Params } from '@angular/router';
import { getRouterSelectors } from '@ngrx/router-store';
import { createSelector } from '@ngrx/store';

const { selectQueryParams } = getRouterSelectors();

export interface DashboardFilters {
  readonly plantId: string;
  readonly shiftId: string;
  readonly lineId: string | null;
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  plantId: 'plant-north',
  shiftId: 'morning',
  lineId: null,
};

const VALID_PLANTS = new Set(['plant-north']);
const VALID_SHIFTS = new Set(['morning', 'afternoon', 'night']);
const VALID_LINES = new Set(['cutting-01', 'forming-01', 'welding-01', 'finishing-01']);

const scalar = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

export const normalizeDashboardFilters = (params: Params | undefined): DashboardFilters => {
  const safeParams = params ?? {};
  const plant = scalar(safeParams['plant']);
  const shift = scalar(safeParams['shift']);
  const line = scalar(safeParams['line']);

  return {
    plantId: plant && VALID_PLANTS.has(plant) ? plant : DEFAULT_DASHBOARD_FILTERS.plantId,
    shiftId: shift && VALID_SHIFTS.has(shift) ? shift : DEFAULT_DASHBOARD_FILTERS.shiftId,
    lineId: line && VALID_LINES.has(line) ? line : DEFAULT_DASHBOARD_FILTERS.lineId,
  };
};

export const selectDashboardFilters = createSelector(selectQueryParams, normalizeDashboardFilters);
