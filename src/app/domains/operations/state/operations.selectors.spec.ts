import { NORTH_PLANT_OVERVIEW } from '../../../core/mock-api/operations.fixtures';
import { initialOperationsState } from './operations.reducer';
import { selectOperationsViewModel } from './operations.selectors';

describe('operations selectors', () => {
  it('returns a loading view model before data arrives', () => {
    const viewModel = selectOperationsViewModel.projector({
      ...initialOperationsState,
      loading: true,
    });

    expect(viewModel.status).toBe('loading');
    expect(viewModel.plantName).toBeNull();
    expect(viewModel.lines).toEqual([]);
  });

  it('maps API data to an operational view model', () => {
    const viewModel = selectOperationsViewModel.projector({
      ...initialOperationsState,
      data: NORTH_PLANT_OVERVIEW,
      lastUpdated: NORTH_PLANT_OVERVIEW.updatedAt,
    });

    expect(viewModel.status).toBe('ready');
    expect(viewModel.plantName).toBe('Planta Norte');
    expect(viewModel.location).toBe('Monterrey, NL');
    expect(viewModel.lines[0]).toMatchObject({ stageName: 'Corte', status: 'operational' });
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
