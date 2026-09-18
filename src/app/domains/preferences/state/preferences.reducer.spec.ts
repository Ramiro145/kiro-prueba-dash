import { PreferencesActions } from './preferences.actions';
import { initialPreferencesState, preferencesReducer } from './preferences.reducer';

describe('preferencesReducer', () => {
  it('hydrates persisted preferences', () => {
    const preferences = { density: 'compact' as const, navigationCollapsed: true };

    expect(
      preferencesReducer(
        initialPreferencesState,
        PreferencesActions.hydrateSuccess({ preferences }),
      ),
    ).toEqual(preferences);
  });

  it('toggles navigation without changing density', () => {
    expect(
      preferencesReducer(initialPreferencesState, PreferencesActions.toggleNavigation()),
    ).toEqual({ density: 'comfortable', navigationCollapsed: true });
  });
});
