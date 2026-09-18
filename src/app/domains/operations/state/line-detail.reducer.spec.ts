import { WELDING_LINE_DETAIL } from '../../../core/mock-api/line-detail.fixtures';
import { LineDetailActions } from './line-detail.actions';
import { initialLineDetailState, lineDetailReducer } from './line-detail.reducer';

describe('lineDetailReducer', () => {
  it('loads a line without retaining data for another identifier', () => {
    const result = lineDetailReducer(
      { ...initialLineDetailState, data: WELDING_LINE_DETAIL },
      LineDetailActions.load({ lineId: 'cutting-01', shiftId: 'morning' }),
    );

    expect(result.loading).toBe(true);
    expect(result.requestedLineId).toBe('cutting-01');
    expect(result.data).toBeNull();
  });

  it('stores a successful detail response', () => {
    const result = lineDetailReducer(
      { ...initialLineDetailState, loading: true, requestedLineId: 'welding-01' },
      LineDetailActions.loadSuccess({ detail: WELDING_LINE_DETAIL }),
    );

    expect(result.loading).toBe(false);
    expect(result.data).toBe(WELDING_LINE_DETAIL);
    expect(result.errorKind).toBeNull();
  });

  it('distinguishes an unknown line from a transport error', () => {
    const result = lineDetailReducer(
      { ...initialLineDetailState, loading: true, requestedLineId: 'missing' },
      LineDetailActions.loadFailure({
        kind: 'notFound',
        error: 'Línea no encontrada.',
      }),
    );

    expect(result.loading).toBe(false);
    expect(result.errorKind).toBe('notFound');
    expect(result.error).toBe('Línea no encontrada.');
  });
});
