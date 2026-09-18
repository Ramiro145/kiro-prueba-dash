import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LineStage, LineStatus } from '../models/operations.models';
import { OPERATIONS_FEATURE_KEY, OperationsState } from './operations.reducer';

export type OperationsViewStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface OperationsLineViewModel {
  readonly id: string;
  readonly name: string;
  readonly stageName: string;
  readonly status: LineStatus;
}

export interface OperationsViewModel {
  readonly status: OperationsViewStatus;
  readonly plantName: string | null;
  readonly location: string | null;
  readonly shiftName: string | null;
  readonly updatedAt: string | null;
  readonly error: string | null;
  readonly lines: readonly OperationsLineViewModel[];
}

const STAGE_NAMES: Record<LineStage, string> = {
  cutting: 'Corte',
  forming: 'Conformado',
  welding: 'Soldadura',
  finishing: 'Acabado',
};

export const selectOperationsState = createFeatureSelector<OperationsState>(OPERATIONS_FEATURE_KEY);

export const selectOperationsViewModel = createSelector(
  selectOperationsState,
  (state): OperationsViewModel => {
    const status: OperationsViewStatus = state.data
      ? 'ready'
      : state.loading
        ? 'loading'
        : state.error
          ? 'error'
          : 'idle';

    return {
      status,
      plantName: state.data?.plant.name ?? null,
      location: state.data?.plant.location ?? null,
      shiftName: state.data?.shift.name ?? null,
      updatedAt: state.lastUpdated,
      error: state.error,
      lines:
        state.data?.lines.map((line) => ({
          id: line.id,
          name: line.name,
          stageName: STAGE_NAMES[line.stage],
          status: line.status,
        })) ?? [],
    };
  },
);
