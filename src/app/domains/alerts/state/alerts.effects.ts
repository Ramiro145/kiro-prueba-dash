import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { AlertsApi } from '../data-access/alerts-api';
import { AlertsActions } from './alerts.actions';

@Injectable()
export class AlertsEffects {
  private readonly actions = inject(Actions);
  private readonly api = inject(AlertsApi);

  readonly load$ = createEffect(() =>
    this.actions.pipe(
      ofType(AlertsActions.load),
      switchMap(({ plantId, shiftId }) =>
        this.api.getAlerts(plantId, shiftId).pipe(
          map((response) => AlertsActions.loadSuccess({ response })),
          catchError(() =>
            of(AlertsActions.loadFailure({ error: 'No se pudieron cargar las alertas.' })),
          ),
        ),
      ),
    ),
  );
}
