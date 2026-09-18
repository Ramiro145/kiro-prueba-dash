import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DashboardDensity, DashboardPreferences } from '../../../core/storage/preferences-storage';

export const PreferencesActions = createActionGroup({
  source: 'Preferences',
  events: {
    Hydrate: emptyProps(),
    'Hydrate Success': props<{ preferences: DashboardPreferences }>(),
    'Toggle Navigation': emptyProps(),
    'Set Density': props<{ density: DashboardDensity }>(),
  },
});
