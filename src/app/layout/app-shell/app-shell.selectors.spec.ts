import { initialAlertsState } from '../../domains/alerts/state/alerts.reducer';
import { initialLineDetailState } from '../../domains/operations/state/line-detail.reducer';
import { initialOperationsState } from '../../domains/operations/state/operations.reducer';
import { selectShellConnectionStatus } from './app-shell.selectors';

describe('app shell selectors', () => {
  it('reports stale overview data instead of claiming normal operation', () => {
    const status = selectShellConnectionStatus.projector(
      '/overview',
      { ...initialOperationsState, stale: true, error: 'Sin conexión' },
      initialAlertsState,
      initialLineDetailState,
    );

    expect(status).toEqual({
      tone: 'warning',
      label: 'Datos desactualizados',
      detail: 'Última lectura conservada',
    });
  });

  it('reports an alert route transport error', () => {
    const status = selectShellConnectionStatus.projector(
      '/alerts',
      initialOperationsState,
      { ...initialAlertsState, error: 'No disponible' },
      initialLineDetailState,
    );

    expect(status.tone).toBe('error');
    expect(status.label).toBe('Sin conexión');
  });
});
