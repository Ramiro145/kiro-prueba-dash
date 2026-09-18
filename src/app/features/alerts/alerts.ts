import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AlertFilters } from '../../domains/alerts/models/alert.models';
import { AlertsActions } from '../../domains/alerts/state/alerts.actions';
import { selectAlertsViewModel } from '../../domains/alerts/state/alerts.selectors';
import { selectDashboardFilters } from '../../domains/operations/state/dashboard-filters.selectors';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-alerts',
  styleUrl: './alerts.scss',
  templateUrl: './alerts.html',
})
export class Alerts implements OnInit {
  private readonly store = inject(Store);

  protected readonly dashboardFilters = this.store.selectSignal(selectDashboardFilters);
  protected readonly viewModel = this.store.selectSignal(selectAlertsViewModel);
  private readonly requestContext = computed(
    () => `${this.dashboardFilters().plantId}|${this.dashboardFilters().shiftId}`,
  );

  constructor() {
    effect(() => {
      const [plantId, shiftId] = this.requestContext().split('|');
      this.store.dispatch(AlertsActions.load({ plantId, shiftId }));
    });
  }

  ngOnInit(): void {
    const lineId = this.dashboardFilters().lineId;
    if (lineId) {
      this.updateFilters({ lineId });
    }
  }

  protected changeSeverity(event: Event): void {
    this.updateFilters({
      severity: (event.target as HTMLSelectElement).value as AlertFilters['severity'],
    });
  }

  protected changeStatus(event: Event): void {
    this.updateFilters({
      status: (event.target as HTMLSelectElement).value as AlertFilters['status'],
    });
  }

  protected changeLine(event: Event): void {
    this.updateFilters({ lineId: (event.target as HTMLSelectElement).value || null });
  }

  protected retry(): void {
    const filters = this.dashboardFilters();
    this.store.dispatch(AlertsActions.load({ plantId: filters.plantId, shiftId: filters.shiftId }));
  }

  private updateFilters(changes: Partial<AlertFilters>): void {
    this.store.dispatch(
      AlertsActions.setFilters({
        filters: { ...this.viewModel().filters, ...changes },
      }),
    );
  }
}
