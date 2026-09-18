import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, filter, map, merge, tap, withLatestFrom } from 'rxjs';
import { DashboardFilters, selectDashboardFilters } from './dashboard-filters.selectors';
import { OperationsActions, OverviewContext } from './operations.actions';

@Injectable()
export class OverviewLifecycleEffects {
  private readonly actions = inject(Actions);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly contextChanges$ = createEffect(() =>
    merge(
      this.actions.pipe(ofType(OperationsActions.enterOverview)),
      this.actions.pipe(
        ofType(routerNavigatedAction),
        filter(({ payload }) => payload.routerState.url.startsWith('/overview')),
      ),
    ).pipe(
      withLatestFrom(this.store.select(selectDashboardFilters)),
      map(([, filters]) => this.contextAction(filters)),
      distinctUntilChanged(
        (previous, current) =>
          previous.context.plantId === current.context.plantId &&
          previous.context.shiftId === current.context.shiftId,
      ),
    ),
  );

  readonly initializeFilterUrl$ = createEffect(
    () =>
      this.actions.pipe(
        ofType(OperationsActions.enterOverview),
        withLatestFrom(this.store.select(selectDashboardFilters)),
        tap(([, filters]) => this.navigate(filters, true)),
      ),
    { dispatch: false },
  );

  readonly navigateToFilters$ = createEffect(
    () =>
      this.actions.pipe(
        ofType(OperationsActions.updateFilters),
        tap(({ filters }) => this.navigate(filters, false)),
      ),
    { dispatch: false },
  );

  private contextAction(filters: DashboardFilters) {
    const context: OverviewContext = {
      plantId: filters.plantId,
      shiftId: filters.shiftId,
    };
    return OperationsActions.setOverviewContext({ context });
  }

  private navigate(filters: DashboardFilters, replaceUrl: boolean): void {
    void this.router.navigate([], {
      queryParams: {
        plant: filters.plantId,
        shift: filters.shiftId,
        line: filters.lineId,
      },
      queryParamsHandling: '',
      ...(replaceUrl ? { replaceUrl: true } : {}),
    });
  }
}
