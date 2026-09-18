import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, Observable, ReplaySubject } from 'rxjs';
import { vi } from 'vitest';
import { PreferencesStorage } from '../../../core/storage/preferences-storage';
import { PreferencesActions } from './preferences.actions';
import { PreferencesEffects } from './preferences.effects';
import { selectPreferences } from './preferences.selectors';

describe('PreferencesEffects', () => {
  let actions: ReplaySubject<Action>;
  let effects: PreferencesEffects;
  const persisted = { density: 'compact' as const, navigationCollapsed: true };
  const storage = { load: vi.fn(() => persisted), save: vi.fn() };

  beforeEach(() => {
    actions = new ReplaySubject<Action>(1);
    storage.load.mockClear();
    storage.save.mockClear();
    TestBed.configureTestingModule({
      providers: [
        PreferencesEffects,
        provideMockActions((): Observable<Action> => actions),
        provideMockStore({ selectors: [{ selector: selectPreferences, value: persisted }] }),
        { provide: PreferencesStorage, useValue: storage },
      ],
    });
    effects = TestBed.inject(PreferencesEffects);
  });

  it('hydrates preferences through the storage boundary', async () => {
    const result = firstValueFrom(effects.hydrate$);

    actions.next(PreferencesActions.hydrate());

    await expect(result).resolves.toEqual(
      PreferencesActions.hydrateSuccess({ preferences: persisted }),
    );
  });

  it('persists the reduced state after a visual preference changes', () => {
    effects.persist$.subscribe();

    actions.next(PreferencesActions.toggleNavigation());

    expect(storage.save).toHaveBeenCalledWith(persisted);
  });
});
