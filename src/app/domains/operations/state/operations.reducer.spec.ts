import { NORTH_PLANT_OVERVIEW } from '../../../core/mock-api/operations.fixtures';
import { OperationsActions } from './operations.actions';
import { initialOperationsState, operationsReducer } from './operations.reducer';

describe('operationsReducer', () => {
  it('marks the overview as loading while retaining existing data', () => {
    const state = { ...initialOperationsState, data: NORTH_PLANT_OVERVIEW, error: 'Anterior' };

    const result = operationsReducer(
      state,
      OperationsActions.loadOverview({ plantId: 'plant-north', shiftId: 'morning' }),
    );

    expect(result).toEqual({ ...state, loading: true, error: null });
  });

  it('stores a successful overview and its update timestamp', () => {
    const result = operationsReducer(
      initialOperationsState,
      OperationsActions.loadOverviewSuccess({ overview: NORTH_PLANT_OVERVIEW }),
    );

    expect(result.data).toBe(NORTH_PLANT_OVERVIEW);
    expect(result.lastUpdated).toBe(NORTH_PLANT_OVERVIEW.updatedAt);
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
  });

  it('exposes a load failure without inventing operational data', () => {
    const result = operationsReducer(
      { ...initialOperationsState, loading: true },
      OperationsActions.loadOverviewFailure({ error: 'Servicio no disponible' }),
    );

    expect(result.data).toBeNull();
    expect(result.loading).toBe(false);
    expect(result.error).toBe('Servicio no disponible');
  });
});
