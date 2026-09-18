import { createFeatureSelector } from '@ngrx/store';
import { PREFERENCES_FEATURE_KEY, PreferencesState } from './preferences.reducer';

export const selectPreferences = createFeatureSelector<PreferencesState>(PREFERENCES_FEATURE_KEY);
