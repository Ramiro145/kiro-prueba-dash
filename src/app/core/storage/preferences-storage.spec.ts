import { TestBed } from '@angular/core/testing';
import { DEFAULT_DASHBOARD_PREFERENCES, PreferencesStorage } from './preferences-storage';

describe('PreferencesStorage', () => {
  let storage: PreferencesStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = TestBed.inject(PreferencesStorage);
  });

  it('returns safe defaults when no preference exists', () => {
    expect(storage.load()).toEqual(DEFAULT_DASHBOARD_PREFERENCES);
  });

  it('persists and restores valid preferences', () => {
    const preferences = { density: 'compact' as const, navigationCollapsed: true };

    storage.save(preferences);

    expect(storage.load()).toEqual(preferences);
  });

  it('ignores malformed persisted values', () => {
    localStorage.setItem('dashboard-acero.preferences', '{invalid');

    expect(storage.load()).toEqual(DEFAULT_DASHBOARD_PREFERENCES);
  });
});
