import { DEFAULT_DASHBOARD_FILTERS, selectDashboardFilters } from './dashboard-filters.selectors';

describe('dashboard filter selectors', () => {
  it('uses safe defaults when query parameters are absent', () => {
    expect(selectDashboardFilters.projector({})).toEqual(DEFAULT_DASHBOARD_FILTERS);
  });

  it('accepts valid plant, shift and line query parameters', () => {
    expect(
      selectDashboardFilters.projector({
        plant: 'plant-north',
        shift: 'afternoon',
        line: 'welding-01',
      }),
    ).toEqual({
      plantId: 'plant-north',
      shiftId: 'afternoon',
      lineId: 'welding-01',
    });
  });

  it('normalizes invalid query parameters instead of issuing invalid requests', () => {
    expect(
      selectDashboardFilters.projector({
        plant: 'unknown',
        shift: 'weekend',
        line: 'missing',
      }),
    ).toEqual(DEFAULT_DASHBOARD_FILTERS);
  });
});
