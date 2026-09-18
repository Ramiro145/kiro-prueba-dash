import { createReducer, on } from '@ngrx/store';
import { PlantOverview } from '../models/operations.models';
import { OperationsActions } from './operations.actions';

export const OPERATIONS_FEATURE_KEY = 'operations';

export interface OperationsState {
  readonly data: PlantOverview | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly lastUpdated: string | null;
}

export const initialOperationsState: OperationsState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

export const operationsReducer = createReducer(
  initialOperationsState,
  on(OperationsActions.loadOverview, (state): OperationsState => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(OperationsActions.loadOverviewSuccess, (state, { overview }): OperationsState => ({
    ...state,
    data: overview,
    loading: false,
    error: null,
    lastUpdated: overview.updatedAt,
  })),
  on(OperationsActions.loadOverviewFailure, (state, { error }): OperationsState => ({
    ...state,
    loading: false,
    error,
  })),
);
