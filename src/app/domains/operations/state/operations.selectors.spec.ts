import { NORTH_PLANT_OVERVIEW } from '../../../core/mock-api/operations.fixtures';
import { DEFAULT_DASHBOARD_FILTERS } from './dashboard-filters.selectors';
import { initialOperationsState } from './operations.reducer';
import {
  selectDashboardOperationsViewModel,
  selectOperationsViewModel,
} from './operations.selectors';

describe('operations selectors', () => {
  it('returns a loading view model before data arrives', () => {
    const viewModel = selectOperationsViewModel.projector({
      ...initialOperationsState,
      loading: true,
    });

    expect(viewModel.status).toBe('loading');
    expect(viewModel.refreshing).toBe(false);
    expect(viewModel.stale).toBe(false);
    expect(viewModel.plantName).toBeNull();
    expect(viewModel.lines).toEqual([]);
    expect(viewModel.kpis).toEqual([]);
  });

  it('maps API data to an operational view model with seven KPIs', () => {
    const viewModel = selectOperationsViewModel.projector({
      ...initialOperationsState,
      data: NORTH_PLANT_OVERVIEW,
      lastUpdated: NORTH_PLANT_OVERVIEW.updatedAt,
    });

    expect(viewModel.status).toBe('ready');
    expect(viewModel.plantName).toBe('Planta Norte');
    expect(viewModel.location).toBe('Monterrey, NL');
    expect(viewModel.activeAlertCount).toBe(4);
    expect(viewModel.lines[0]).toMatchObject({ stageName: 'Corte', status: 'operational' });
    expect(viewModel.kpis.map(({ id, value }) => ({ id, value }))).toEqual([
      { id: 'oee', value: '78.0%' },
      { id: 'availability', value: '84.0%' },
      { id: 'performance', value: '95.0%' },
      { id: 'quality', value: '98.0%' },
      { id: 'production', value: '1,562 / 1,850' },
      { id: 'scrap', value: '1.9%' },
      { id: 'downtime', value: '135 min' },
    ]);
  });

  it('scopes lines and KPIs when a line filter is active', () => {
    const state = {
      ...initialOperationsState,
      data: NORTH_PLANT_OVERVIEW,
    };
    const baseViewModel = selectOperationsViewModel.projector(state);
    const viewModel = selectDashboardOperationsViewModel.projector(baseViewModel, state, {
      ...DEFAULT_DASHBOARD_FILTERS,
      lineId: 'welding-01',
    });

    expect(viewModel.lines.map(({ id }) => id)).toEqual(['welding-01']);
    expect(viewModel.kpis.find(({ id }) => id === 'oee')?.value).toBe('61.0%');
    expect(viewModel.kpis.find(({ id }) => id === 'downtime')?.value).toBe('78 min');
  });

  it('returns an explicit empty view model for an overview without lines', () => {
    const viewModel = selectOperationsViewModel.projector({
      ...initialOperationsState,
      data: { ...NORTH_PLANT_OVERVIEW, lines: [] },
    });

    expect(viewModel.status).toBe('empty');
    expect(viewModel.lines).toEqual([]);
  });

  it('keeps ready data visible while exposing refresh degradation', () => {
    const viewModel = selectOperationsViewModel.projector({
      ...initialOperationsState,
      data: NORTH_PLANT_OVERVIEW,
      stale: true,
      error: 'Servicio no disponible',
    });

    expect(viewModel.status).toBe('ready');
    expect(viewModel.stale).toBe(true);
    expect(viewModel.error).toBe('Servicio no disponible');
    expect(viewModel.lines).toHaveLength(4);
  });

  it('represents unavailable metrics safely and protects division by zero', () => {
    const viewModel = selectOperationsViewModel.projector({
      ...initialOperationsState,
      data: {
        ...NORTH_PLANT_OVERVIEW,
        metrics: { oee: null, availability: null, performance: null, quality: null },
        snapshot: {
          ...NORTH_PLANT_OVERVIEW.snapshot,
          producedUnits: 0,
          targetUnits: 0,
          goodUnits: 0,
          scrapUnits: 0,
          downtimeMinutes: null,
        },
      },
    });

    expect(viewModel.kpis.find(({ id }) => id === 'oee')?.value).toBe('—');
    expect(viewModel.kpis.find(({ id }) => id === 'production')?.supportingText).toBe(
      'Meta no disponible',
    );
    expect(viewModel.kpis.find(({ id }) => id === 'scrap')?.value).toBe('—');
    expect(viewModel.kpis.find(({ id }) => id === 'downtime')?.value).toBe('—');
    expect(viewModel.kpis.map(({ value }) => value).join(' ')).not.toMatch(/NaN|Infinity/);
  });

  it('returns an error view model when the initial request fails', () => {
    const viewModel = selectOperationsViewModel.projector({
      ...initialOperationsState,
      error: 'Servicio no disponible',
    });

    expect(viewModel.status).toBe('error');
    expect(viewModel.error).toBe('Servicio no disponible');
  });
});
