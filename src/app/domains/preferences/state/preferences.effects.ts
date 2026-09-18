import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, tap, withLatestFrom } from 'rxjs';
import { PreferencesStorage } from '../../../core/storage/preferences-storage';
import { PreferencesActions } from './preferences.actions';
import { selectPreferences } from './preferences.selectors';

@Injectable()
export class PreferencesEffects {
  private readonly actions = inject(Actions);
  private readonly store = inject(Store);
  private readonly storage = inject(PreferencesStorage);

  readonly hydrate$ = createEffect(() =>
    this.actions.pipe(
      ofType(PreferencesActions.hydrate),
      map(() => PreferencesActions.hydrateSuccess({ preferences: this.storage.load() })),
    ),
  );

  readonly persist$ = createEffect(
    () =>
      this.actions.pipe(
        ofType(PreferencesActions.toggleNavigation, PreferencesActions.setDensity),
        withLatestFrom(this.store.select(selectPreferences)),
        tap(([, preferences]) => this.storage.save(preferences)),
      ),
    { dispatch: false },
  );
}
