import { inject, Injectable, InjectionToken } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concat, exhaustMap, map, merge, of, switchMap, takeUntil, timer } from 'rxjs';
import { OperationsApi } from '../data-access/operations-api';
import { OperationsActions } from './operations.actions';

export const OVERVIEW_POLL_INTERVAL = new InjectionToken<number>('OVERVIEW_POLL_INTERVAL', {
  factory: () => 30_000,
});

@Injectable()
export class OperationsEffects {
  private readonly actions = inject(Actions);
  private readonly operationsApi = inject(OperationsApi);
  private readonly pollInterval = inject(OVERVIEW_POLL_INTERVAL);

  readonly loadOverview$ = createEffect(() =>
    this.actions.pipe(
      ofType(OperationsActions.setOverviewContext),
      switchMap(({ context }) =>
        merge(
          timer(0, this.pollInterval),
          this.actions.pipe(ofType(OperationsActions.refreshOverview)),
        ).pipe(
          exhaustMap(() =>
            concat(
              of(OperationsActions.loadOverview({ context })),
              this.operationsApi.getOverview(context.plantId, context.shiftId).pipe(
                map((overview) => OperationsActions.loadOverviewSuccess({ context, overview })),
                catchError(() =>
                  of(
                    OperationsActions.loadOverviewFailure({
                      context,
                      error: 'No se pudo cargar el resumen de planta.',
                    }),
                  ),
                ),
              ),
            ),
          ),
          takeUntil(this.actions.pipe(ofType(OperationsActions.leaveOverview))),
        ),
      ),
    ),
  );
}
