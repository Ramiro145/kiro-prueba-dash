import { createReducer, on } from '@ngrx/store';
import {
  DashboardPreferences,
  DEFAULT_DASHBOARD_PREFERENCES,
} from '../../../core/storage/preferences-storage';
import { PreferencesActions } from './preferences.actions';

export const PREFERENCES_FEATURE_KEY = 'preferences';
export type PreferencesState = DashboardPreferences;

export const initialPreferencesState: PreferencesState = DEFAULT_DASHBOARD_PREFERENCES;

export const preferencesReducer = createReducer(
  initialPreferencesState,
  on(PreferencesActions.hydrateSuccess, (_state, { preferences }): PreferencesState => preferences),
  on(PreferencesActions.toggleNavigation, (state): PreferencesState => ({
    ...state,
    navigationCollapsed: !state.navigationCollapsed,
  })),
  on(PreferencesActions.setDensity, (state, { density }): PreferencesState => ({
    ...state,
    density,
  })),
);
