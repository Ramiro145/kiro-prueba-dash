import { createReducer, on } from '@ngrx/store';
import { PlantOverview } from '../models/operations.models';
import { OperationsActions, OverviewContext } from './operations.actions';

export const OPERATIONS_FEATURE_KEY = 'operations';

export interface OperationsState {
  readonly data: PlantOverview | null;
  readonly dataContext: OverviewContext | null;
  readonly activeContext: OverviewContext | null;
  readonly loading: boolean;
  readonly refreshing: boolean;
  readonly stale: boolean;
  readonly error: string | null;
  readonly lastUpdated: string | null;
}

export const initialOperationsState: OperationsState = {
  data: null,
  dataContext: null,
  activeContext: null,
  loading: false,
  refreshing: false,
  stale: false,
  error: null,
  lastUpdated: null,
};

const sameContext = (left: OverviewContext | null, right: OverviewContext): boolean =>
  left?.plantId === right.plantId && left.shiftId === right.shiftId;

export const operationsReducer = createReducer(
  initialOperationsState,
  on(OperationsActions.setOverviewContext, (state, { context }): OperationsState => {
    if (sameContext(state.dataContext, context)) {
      return { ...state, activeContext: context };
    }
    return {
      ...state,
      data: null,
      dataContext: null,
      activeContext: context,
      loading: true,
      refreshing: false,
      stale: false,
      error: null,
      lastUpdated: null,
    };
  }),
  on(OperationsActions.loadOverview, (state, { context }): OperationsState => {
    const retainData = state.data !== null && sameContext(state.dataContext, context);
    return {
      ...state,
      data: retainData ? state.data : null,
      dataContext: retainData ? state.dataContext : null,
      activeContext: context,
      loading: !retainData,
      refreshing: retainData,
      stale: retainData ? state.stale : false,
      error: retainData ? state.error : null,
      lastUpdated: retainData ? state.lastUpdated : null,
    };
  }),
  on(OperationsActions.loadOverviewSuccess, (state, { context, overview }): OperationsState => {
    if (!sameContext(state.activeContext, context)) {
      return state;
    }
    return {
      ...state,
      data: overview,
      dataContext: context,
      loading: false,
      refreshing: false,
      stale: false,
      error: null,
      lastUpdated: overview.updatedAt,
    };
  }),
  on(OperationsActions.loadOverviewFailure, (state, { context, error }): OperationsState => {
    if (!sameContext(state.activeContext, context)) {
      return state;
    }
    const retainData = state.data !== null && sameContext(state.dataContext, context);
    return {
      ...state,
      data: retainData ? state.data : null,
      loading: false,
      refreshing: false,
      stale: retainData,
      error,
    };
  }),
);
