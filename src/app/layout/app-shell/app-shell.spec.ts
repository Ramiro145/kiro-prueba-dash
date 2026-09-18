import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { vi } from 'vitest';
import {
  DEFAULT_DASHBOARD_FILTERS,
  selectDashboardFilters,
} from '../../domains/operations/state/dashboard-filters.selectors';
import { PreferencesActions } from '../../domains/preferences/state/preferences.actions';
import { selectPreferences } from '../../domains/preferences/state/preferences.selectors';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  let store: MockStore;
  const preferences = { density: 'comfortable' as const, navigationCollapsed: true };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [
            { selector: selectPreferences, value: preferences },
            { selector: selectDashboardFilters, value: DEFAULT_DASHBOARD_FILTERS },
          ],
        }),
      ],
    }).compileComponents();
    store = TestBed.inject(MockStore);
  });

  it('renders the operational navigation destinations', () => {
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    const links = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('nav a'),
    ];

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Resumen',
      'Detalle de línea',
      'Alertas',
    ]);
  });

  it('hydrates preferences and dispatches navigation changes through NgRx', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const toggle = element.querySelector<HTMLButtonElement>('[data-testid="navigation-toggle"]');

    expect(dispatch).toHaveBeenCalledWith(PreferencesActions.hydrate());
    expect(element.querySelector('.shell')?.classList).toContain('shell--collapsed');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');

    toggle?.click();
    expect(dispatch).toHaveBeenCalledWith(PreferencesActions.toggleNavigation());
  });
});
