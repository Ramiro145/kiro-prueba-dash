import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

export type DashboardDensity = 'comfortable' | 'compact';

export interface DashboardPreferences {
  readonly density: DashboardDensity;
  readonly navigationCollapsed: boolean;
}

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  density: 'comfortable',
  navigationCollapsed: false,
};

const STORAGE_KEY = 'dashboard-acero.preferences';

@Injectable({ providedIn: 'root' })
export class PreferencesStorage {
  private readonly document = inject(DOCUMENT);

  load(): DashboardPreferences {
    const persisted = this.readPersistedValue();

    if (!persisted || !this.isDashboardPreferences(persisted)) {
      return DEFAULT_DASHBOARD_PREFERENCES;
    }

    return persisted;
  }

  save(preferences: DashboardPreferences): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Storage can be unavailable in privacy modes; preferences remain optional.
    }
  }

  private readPersistedValue(): unknown {
    try {
      const value = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  private isDashboardPreferences(value: unknown): value is DashboardPreferences {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<DashboardPreferences>;
    return (
      (candidate.density === 'comfortable' || candidate.density === 'compact') &&
      typeof candidate.navigationCollapsed === 'boolean'
    );
  }
}
