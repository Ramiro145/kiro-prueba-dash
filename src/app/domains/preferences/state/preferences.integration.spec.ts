import { TestBed } from '@angular/core/testing';
import { provideEffects } from '@ngrx/effects';
import { provideStore, Store } from '@ngrx/store';
import { vi } from 'vitest';
import { PreferencesStorage } from '../../../core/storage/preferences-storage';
import { PreferencesActions } from './preferences.actions';
import { PreferencesEffects } from './preferences.effects';
import { PREFERENCES_FEATURE_KEY, preferencesReducer } from './preferences.reducer';

describe('preferences store flow', () => {
  it('persists the state after the reducer applies a navigation toggle', () => {
    const persisted = { density: 'compact' as const, navigationCollapsed: true };
    const storage = { load: vi.fn(() => persisted), save: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideStore({ [PREFERENCES_FEATURE_KEY]: preferencesReducer }),
        provideEffects(PreferencesEffects),
        { provide: PreferencesStorage, useValue: storage },
      ],
    });
    const store = TestBed.inject(Store);

    store.dispatch(PreferencesActions.hydrate());
    TestBed.tick();
    store.dispatch(PreferencesActions.toggleNavigation());
    TestBed.tick();

    expect(storage.save).toHaveBeenCalledWith({
      density: 'compact',
      navigationCollapsed: false,
    });
  });
});
