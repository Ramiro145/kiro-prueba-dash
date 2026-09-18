import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { firstValueFrom, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { WELDING_LINE_DETAIL } from '../../../core/mock-api/line-detail.fixtures';
import { OperationsApi } from '../data-access/operations-api';
import { LineDetailActions } from './line-detail.actions';
import { LineDetailEffects } from './line-detail.effects';

describe('LineDetailEffects', () => {
  let actions: ReplaySubject<Action>;
  let effects: LineDetailEffects;
  const api = { getLineDetail: vi.fn() };

  beforeEach(() => {
    actions = new ReplaySubject<Action>(1);
    api.getLineDetail.mockReset();
    TestBed.configureTestingModule({
      providers: [
        LineDetailEffects,
        provideMockActions((): Observable<Action> => actions),
        { provide: OperationsApi, useValue: api },
      ],
    });
    effects = TestBed.inject(LineDetailEffects);
  });

  it('loads line detail using route and shift identifiers', async () => {
    api.getLineDetail.mockReturnValue(of(WELDING_LINE_DETAIL));
    const result = firstValueFrom(effects.load$);

    actions.next(LineDetailActions.load({ lineId: 'welding-01', shiftId: 'morning' }));

    await expect(result).resolves.toEqual(
      LineDetailActions.loadSuccess({ detail: WELDING_LINE_DETAIL }),
    );
    expect(api.getLineDetail).toHaveBeenCalledWith('welding-01', 'morning');
  });

  it('maps HTTP 404 to a not-found state', async () => {
    api.getLineDetail.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not found' })),
    );
    const result = firstValueFrom(effects.load$);

    actions.next(LineDetailActions.load({ lineId: 'missing', shiftId: 'morning' }));

    await expect(result).resolves.toEqual(
      LineDetailActions.loadFailure({ kind: 'notFound', error: 'Línea no encontrada.' }),
    );
  });
});
