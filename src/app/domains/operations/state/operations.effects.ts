import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { OperationsApi } from '../data-access/operations-api';
import { OperationsActions } from './operations.actions';

@Injectable()
export class OperationsEffects {
  private readonly actions = inject(Actions);
  private readonly operationsApi = inject(OperationsApi);

  readonly loadOverview$ = createEffect(() =>
    this.actions.pipe(
      ofType(OperationsActions.loadOverview),
      switchMap(({ plantId, shiftId }) =>
        this.operationsApi.getOverview(plantId, shiftId).pipe(
          map((overview) => OperationsActions.loadOverviewSuccess({ overview })),
          catchError(() =>
            of(
              OperationsActions.loadOverviewFailure({
                error: 'No se pudo cargar el resumen de planta.',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
