import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { firstValueFrom, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { NORTH_PLANT_OVERVIEW } from '../../../core/mock-api/operations.fixtures';
import { OperationsApi } from '../data-access/operations-api';
import { OperationsActions } from './operations.actions';
import { OperationsEffects } from './operations.effects';

describe('OperationsEffects', () => {
  let actions: ReplaySubject<Action>;
  let effects: OperationsEffects;
  const api = {
    getOverview: vi.fn(),
  };

  beforeEach(() => {
    actions = new ReplaySubject<Action>(1);
    api.getOverview.mockReset();
    TestBed.configureTestingModule({
      providers: [
        OperationsEffects,
        provideMockActions((): Observable<Action> => actions),
        { provide: OperationsApi, useValue: api },
      ],
    });
    effects = TestBed.inject(OperationsEffects);
  });

  it('loads the requested overview', async () => {
    api.getOverview.mockReturnValue(of(NORTH_PLANT_OVERVIEW));
    const result = firstValueFrom(effects.loadOverview$);

    actions.next(OperationsActions.loadOverview({ plantId: 'plant-north', shiftId: 'morning' }));

    await expect(result).resolves.toEqual(
      OperationsActions.loadOverviewSuccess({ overview: NORTH_PLANT_OVERVIEW }),
    );
    expect(api.getOverview).toHaveBeenCalledWith('plant-north', 'morning');
  });

  it('maps HTTP failures to a safe user-facing action', async () => {
    api.getOverview.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 503, statusText: 'Unavailable' })),
    );
    const result = firstValueFrom(effects.loadOverview$);

    actions.next(OperationsActions.loadOverview({ plantId: 'plant-north', shiftId: 'morning' }));

    await expect(result).resolves.toEqual(
      OperationsActions.loadOverviewFailure({
        error: 'No se pudo cargar el resumen de planta.',
      }),
    );
  });
});
