import { NORTH_PLANT_OVERVIEW } from '../../../core/mock-api/operations.fixtures';
import { OperationsActions, OverviewContext } from './operations.actions';
import { initialOperationsState, operationsReducer } from './operations.reducer';

const morning: OverviewContext = { plantId: 'plant-north', shiftId: 'morning' };
const night: OverviewContext = { plantId: 'plant-north', shiftId: 'night' };

describe('operationsReducer', () => {
  it('marks an initial overview request as loading with its context', () => {
    const result = operationsReducer(
      initialOperationsState,
      OperationsActions.loadOverview({ context: morning }),
    );

    expect(result).toEqual({
      ...initialOperationsState,
      activeContext: morning,
      loading: true,
      refreshing: false,
      error: null,
    });
  });

  it('retains data only when refreshing the same context', () => {
    const state = {
      ...initialOperationsState,
      data: NORTH_PLANT_OVERVIEW,
      dataContext: morning,
      activeContext: morning,
    };

    const result = operationsReducer(state, OperationsActions.loadOverview({ context: morning }));

    expect(result.loading).toBe(false);
    expect(result.refreshing).toBe(true);
    expect(result.data).toBe(NORTH_PLANT_OVERVIEW);
  });

  it('clears old data when loading a different shift context', () => {
    const result = operationsReducer(
      {
        ...initialOperationsState,
        data: NORTH_PLANT_OVERVIEW,
        dataContext: morning,
        activeContext: morning,
        lastUpdated: NORTH_PLANT_OVERVIEW.updatedAt,
      },
      OperationsActions.setOverviewContext({ context: night }),
    );

    expect(result.data).toBeNull();
    expect(result.dataContext).toBeNull();
    expect(result.activeContext).toEqual(night);
    expect(result.loading).toBe(true);
    expect(result.lastUpdated).toBeNull();
  });

  it('stores a successful overview and clears degradation', () => {
    const result = operationsReducer(
      { ...initialOperationsState, activeContext: morning, stale: true, error: 'Anterior' },
      OperationsActions.loadOverviewSuccess({ context: morning, overview: NORTH_PLANT_OVERVIEW }),
    );

    expect(result.data).toBe(NORTH_PLANT_OVERVIEW);
    expect(result.dataContext).toEqual(morning);
    expect(result.lastUpdated).toBe(NORTH_PLANT_OVERVIEW.updatedAt);
    expect(result.loading).toBe(false);
    expect(result.refreshing).toBe(false);
    expect(result.stale).toBe(false);
    expect(result.error).toBeNull();
  });

  it('retains previous data and marks it stale after a same-context refresh failure', () => {
    const result = operationsReducer(
      {
        ...initialOperationsState,
        data: NORTH_PLANT_OVERVIEW,
        dataContext: morning,
        activeContext: morning,
        refreshing: true,
      },
      OperationsActions.loadOverviewFailure({
        context: morning,
        error: 'Servicio no disponible',
      }),
    );

    expect(result.data).toBe(NORTH_PLANT_OVERVIEW);
    expect(result.refreshing).toBe(false);
    expect(result.stale).toBe(true);
    expect(result.error).toBe('Servicio no disponible');
  });

  it('clears transient loading flags when overview is left', () => {
    const result = operationsReducer(
      { ...initialOperationsState, activeContext: morning, refreshing: true },
      OperationsActions.leaveOverview(),
    );

    expect(result.refreshing).toBe(false);
    expect(result.loading).toBe(false);
  });

  it('ignores a late result from an obsolete context', () => {
    const state = { ...initialOperationsState, activeContext: night, loading: true };

    const result = operationsReducer(
      state,
      OperationsActions.loadOverviewSuccess({ context: morning, overview: NORTH_PLANT_OVERVIEW }),
    );

    expect(result).toBe(state);
  });
});
