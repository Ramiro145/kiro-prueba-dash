import { getRouterSelectors } from '@ngrx/router-store';
import { createSelector } from '@ngrx/store';
import { selectAlertsState } from '../../domains/alerts/state/alerts.selectors';
import { selectLineDetailState } from '../../domains/operations/state/line-detail.selectors';
import { selectOperationsState } from '../../domains/operations/state/operations.selectors';

export type ConnectionTone = 'stable' | 'loading' | 'warning' | 'error';

export interface ShellConnectionStatus {
  readonly tone: ConnectionTone;
  readonly label: string;
  readonly detail: string;
}

const { selectUrl } = getRouterSelectors();
const stable: ShellConnectionStatus = {
  tone: 'stable',
  label: 'Sistema operativo',
  detail: 'Contexto sincronizado',
};
const loading: ShellConnectionStatus = {
  tone: 'loading',
  label: 'Actualizando',
  detail: 'Consulta en curso',
};
const error: ShellConnectionStatus = {
  tone: 'error',
  label: 'Sin conexión',
  detail: 'Revisa el estado de la vista',
};

export const selectShellConnectionStatus = createSelector(
  selectUrl,
  selectOperationsState,
  selectAlertsState,
  selectLineDetailState,
  (url, operations, alerts, lineDetail): ShellConnectionStatus => {
    if (url?.startsWith('/alerts')) {
      if (alerts.error) return error;
      return alerts.loading ? loading : stable;
    }
    if (url?.startsWith('/lines/')) {
      if (lineDetail.error) return error;
      return lineDetail.loading ? loading : stable;
    }
    if (operations.stale) {
      return {
        tone: 'warning',
        label: 'Datos desactualizados',
        detail: 'Última lectura conservada',
      };
    }
    if (operations.error) return error;
    return operations.loading || operations.refreshing ? loading : stable;
  },
);
