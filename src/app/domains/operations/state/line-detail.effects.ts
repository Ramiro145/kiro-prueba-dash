import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { OperationsApi } from '../data-access/operations-api';
import { LineDetailActions } from './line-detail.actions';

@Injectable()
export class LineDetailEffects {
  private readonly actions = inject(Actions);
  private readonly api = inject(OperationsApi);

  readonly load$ = createEffect(() =>
    this.actions.pipe(
      ofType(LineDetailActions.load),
      switchMap(({ lineId, shiftId }) =>
        this.api.getLineDetail(lineId, shiftId).pipe(
          map((detail) => LineDetailActions.loadSuccess({ detail })),
          catchError((error: unknown) => {
            const notFound = error instanceof HttpErrorResponse && error.status === 404;
            return of(
              LineDetailActions.loadFailure({
                kind: notFound ? 'notFound' : 'transport',
                error: notFound ? 'Línea no encontrada.' : 'No se pudo cargar el detalle de línea.',
              }),
            );
          }),
        ),
      ),
    ),
  );
}
