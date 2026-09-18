import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { PreferencesStorage } from '../../core/storage/preferences-storage';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  const storage = {
    load: vi.fn(() => ({ density: 'comfortable' as const, navigationCollapsed: true })),
    save: vi.fn(),
  };

  beforeEach(async () => {
    storage.load.mockClear();
    storage.save.mockClear();

    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([]), { provide: PreferencesStorage, useValue: storage }],
    }).compileComponents();
  });

  it('renders the operational navigation destinations', () => {
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const links = [...element.querySelectorAll<HTMLAnchorElement>('nav a')];

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Resumen',
      'Detalle de línea',
      'Alertas',
    ]);
  });

  it('restores and persists the collapsed navigation preference', () => {
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const toggle = element.querySelector<HTMLButtonElement>('[data-testid="navigation-toggle"]');

    expect(element.querySelector('.shell')?.classList).toContain('shell--collapsed');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');

    toggle?.click();
    fixture.detectChanges();

    expect(storage.save).toHaveBeenCalledWith({
      density: 'comfortable',
      navigationCollapsed: false,
    });
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
  });
});
