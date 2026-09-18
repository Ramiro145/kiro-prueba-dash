import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Observable, of, ReplaySubject, Subject, Subscription, throwError } from 'rxjs';
import { vi } from 'vitest';
import { NORTH_PLANT_OVERVIEW } from '../../../core/mock-api/operations.fixtures';
import { PlantOverview } from '../models/operations.models';
import { OperationsApi } from '../data-access/operations-api';
import { OperationsActions, OverviewContext } from './operations.actions';
import { OperationsEffects, OVERVIEW_POLL_INTERVAL } from './operations.effects';

describe('OperationsEffects', () => {
  let actions: ReplaySubject<Action>;
  let effects: OperationsEffects;
  let subscription: Subscription;
  const context: OverviewContext = { plantId: 'plant-north', shiftId: 'morning' };
  const api = { getOverview: vi.fn() };

  beforeEach(() => {
    vi.useFakeTimers();
    actions = new ReplaySubject<Action>(1);
    api.getOverview.mockReset();
    TestBed.configureTestingModule({
      providers: [
        OperationsEffects,
        provideMockActions((): Observable<Action> => actions),
        { provide: OperationsApi, useValue: api },
        { provide: OVERVIEW_POLL_INTERVAL, useValue: 30_000 },
      ],
    });
    effects = TestBed.inject(OperationsEffects);
  });

  afterEach(() => {
    subscription?.unsubscribe();
    vi.useRealTimers();
  });

  it('emits loading and success for the active context', async () => {
    api.getOverview.mockReturnValue(of(NORTH_PLANT_OVERVIEW));
    const emitted: Action[] = [];
    subscription = effects.loadOverview$.subscribe((action) => emitted.push(action));

    actions.next(OperationsActions.setOverviewContext({ context }));
    await vi.advanceTimersByTimeAsync(0);

    expect(emitted).toEqual([
      OperationsActions.loadOverview({ context }),
      OperationsActions.loadOverviewSuccess({ context, overview: NORTH_PLANT_OVERVIEW }),
    ]);
    expect(api.getOverview).toHaveBeenCalledWith('plant-north', 'morning');
  });

  it('maps HTTP failures to the same requested context', async () => {
    api.getOverview.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 503, statusText: 'Unavailable' })),
    );
    const emitted: Action[] = [];
    subscription = effects.loadOverview$.subscribe((action) => emitted.push(action));

    actions.next(OperationsActions.setOverviewContext({ context }));
    await vi.advanceTimersByTimeAsync(0);

    expect(emitted.at(-1)).toEqual(
      OperationsActions.loadOverviewFailure({
        context,
        error: 'No se pudo cargar el resumen de planta.',
      }),
    );
  });

  it('cancels the old request when the plant or shift context changes', async () => {
    const firstResponse = new Subject<PlantOverview>();
    const secondResponse = new Subject<PlantOverview>();
    const nightContext = { ...context, shiftId: 'night' };
    const emitted: Action[] = [];
    api.getOverview.mockReturnValueOnce(firstResponse).mockReturnValueOnce(secondResponse);
    subscription = effects.loadOverview$.subscribe((action) => emitted.push(action));

    actions.next(OperationsActions.setOverviewContext({ context }));
    await vi.advanceTimersByTimeAsync(0);
    actions.next(OperationsActions.setOverviewContext({ context: nightContext }));
    await vi.advanceTimersByTimeAsync(0);
    firstResponse.next(NORTH_PLANT_OVERVIEW);
    secondResponse.next({
      ...NORTH_PLANT_OVERVIEW,
      shift: { ...NORTH_PLANT_OVERVIEW.shift, id: 'night', name: 'Turno noche' },
    });

    const successes = emitted.filter(
      ({ type }) => type === OperationsActions.loadOverviewSuccess.type,
    );
    expect(successes).toHaveLength(1);
    expect(successes[0]).toMatchObject({ context: nightContext });
  });

  it('does not cancel a slow request at the next polling tick and cancels it on leave', async () => {
    const response = new Subject<PlantOverview>();
    api.getOverview.mockReturnValue(response);
    subscription = effects.loadOverview$.subscribe();

    actions.next(OperationsActions.setOverviewContext({ context }));
    await vi.advanceTimersByTimeAsync(0);
    expect(api.getOverview).toHaveBeenCalledTimes(1);
    expect(response.observed).toBe(true);

    await vi.advanceTimersByTimeAsync(30_000);
    expect(api.getOverview).toHaveBeenCalledTimes(1);
    expect(response.observed).toBe(true);

    actions.next(OperationsActions.leaveOverview());
    expect(response.observed).toBe(false);
  });
});
