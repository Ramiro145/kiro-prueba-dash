import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, computed, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';
import { selectDashboardFilters } from '../../domains/operations/state/dashboard-filters.selectors';
import { PreferencesActions } from '../../domains/preferences/state/preferences.actions';
import { selectPreferences } from '../../domains/preferences/state/preferences.selectors';
import { selectShellConnectionStatus } from './app-shell.selectors';

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
  private readonly router = inject(Router);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly mainContent = viewChild<ElementRef<HTMLElement>>('mainContent');

  protected readonly filters = this.store.selectSignal(selectDashboardFilters);
  protected readonly preferences = this.store.selectSignal(selectPreferences);
  protected readonly connectionStatus = this.store.selectSignal(selectShellConnectionStatus);
  protected readonly shiftName = computed(() => SHIFT_NAMES[this.filters().shiftId] ?? 'Mañana');
  protected readonly selectedLineId = computed(() => this.filters().lineId ?? 'cutting-01');

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() =>
        queueMicrotask(() => {
          const content = this.mainContent()?.nativeElement;
          if (content) {
            this.focusMonitor.focusVia(content, 'program');
          }
        }),
      );
  }

  ngOnInit(): void {
    this.store.dispatch(PreferencesActions.hydrate());
  }

  protected toggleNavigation(): void {
    this.store.dispatch(PreferencesActions.toggleNavigation());
  }

  protected toggleDensity(): void {
    this.store.dispatch(
      PreferencesActions.setDensity({
        density: this.preferences().density === 'compact' ? 'comfortable' : 'compact',
      }),
    );
  }
}
