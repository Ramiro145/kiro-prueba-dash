import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectDashboardFilters } from '../../domains/operations/state/dashboard-filters.selectors';
import { PreferencesActions } from '../../domains/preferences/state/preferences.actions';
import { selectPreferences } from '../../domains/preferences/state/preferences.selectors';

const SHIFT_NAMES: Record<string, string> = {
  morning: 'Mañana',
  afternoon: 'Tarde',
  night: 'Noche',
};

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-shell',
  styleUrl: './app-shell.scss',
  templateUrl: './app-shell.html',
})
export class AppShell implements OnInit {
  private readonly store = inject(Store);
  private readonly filters = this.store.selectSignal(selectDashboardFilters);

  protected readonly preferences = this.store.selectSignal(selectPreferences);
  protected readonly shiftName = computed(() => SHIFT_NAMES[this.filters().shiftId] ?? 'Mañana');

  ngOnInit(): void {
    this.store.dispatch(PreferencesActions.hydrate());
  }

  protected toggleNavigation(): void {
    this.store.dispatch(PreferencesActions.toggleNavigation());
  }
}
