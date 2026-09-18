import { createReducer, on } from '@ngrx/store';
import { LineDetailData } from '../models/operations.models';
import { LineDetailActions, LineDetailErrorKind } from './line-detail.actions';

export const LINE_DETAIL_FEATURE_KEY = 'lineDetail';

export interface LineDetailState {
  readonly data: LineDetailData | null;
  readonly requestedLineId: string | null;
  readonly loading: boolean;
  readonly errorKind: LineDetailErrorKind | null;
  readonly error: string | null;
}

export const initialLineDetailState: LineDetailState = {
  data: null,
  requestedLineId: null,
  loading: false,
  errorKind: null,
  error: null,
};

export const lineDetailReducer = createReducer(
  initialLineDetailState,
  on(LineDetailActions.load, (_state, { lineId }): LineDetailState => ({
    data: null,
    requestedLineId: lineId,
    loading: true,
    errorKind: null,
    error: null,
  })),
  on(LineDetailActions.loadSuccess, (state, { detail }): LineDetailState => ({
    ...state,
    data: detail,
    requestedLineId: detail.line.id,
    loading: false,
    errorKind: null,
    error: null,
  })),
  on(LineDetailActions.loadFailure, (state, { kind, error }): LineDetailState => ({
    ...state,
    data: null,
    loading: false,
    errorKind: kind,
    error,
  })),
  on(LineDetailActions.clear, (): LineDetailState => initialLineDetailState),
);
