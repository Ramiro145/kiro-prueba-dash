import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DashboardPreferences, PreferencesStorage } from '../../core/storage/preferences-storage';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-shell',
  styleUrl: './app-shell.scss',
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly preferencesStorage = inject(PreferencesStorage);

  protected readonly preferences = signal<DashboardPreferences>(this.preferencesStorage.load());

  protected toggleNavigation(): void {
    this.preferences.update((current) => {
      const updated = {
        ...current,
        navigationCollapsed: !current.navigationCollapsed,
      };
      this.preferencesStorage.save(updated);
      return updated;
    });
  }
}
