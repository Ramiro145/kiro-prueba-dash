import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { firstValueFrom, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ALERTS_RESPONSE } from '../../../core/mock-api/alerts.fixtures';
import { AlertsApi } from '../data-access/alerts-api';
import { AlertsActions } from './alerts.actions';
import { AlertsEffects } from './alerts.effects';

describe('AlertsEffects', () => {
  let actions: ReplaySubject<Action>;
  let effects: AlertsEffects;
  const api = { getAlerts: vi.fn() };

  beforeEach(() => {
    actions = new ReplaySubject<Action>(1);
    api.getAlerts.mockReset();
    TestBed.configureTestingModule({
      providers: [
        AlertsEffects,
        provideMockActions((): Observable<Action> => actions),
        { provide: AlertsApi, useValue: api },
      ],
    });
    effects = TestBed.inject(AlertsEffects);
  });

  it('loads alerts for the active plant and shift', async () => {
    api.getAlerts.mockReturnValue(of(ALERTS_RESPONSE));
    const result = firstValueFrom(effects.load$);

    actions.next(AlertsActions.load({ plantId: 'plant-north', shiftId: 'morning' }));

    await expect(result).resolves.toEqual(AlertsActions.loadSuccess({ response: ALERTS_RESPONSE }));
  });

  it('maps transport failures to a safe message', async () => {
    api.getAlerts.mockReturnValue(throwError(() => new Error('offline')));
    const result = firstValueFrom(effects.load$);

    actions.next(AlertsActions.load({ plantId: 'plant-north', shiftId: 'morning' }));

    await expect(result).resolves.toEqual(
      AlertsActions.loadFailure({ error: 'No se pudieron cargar las alertas.' }),
    );
  });
});
