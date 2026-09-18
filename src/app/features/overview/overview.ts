import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { LineStatus } from '../../domains/operations/models/operations.models';
import {
  DashboardFilters,
  selectDashboardFilters,
} from '../../domains/operations/state/dashboard-filters.selectors';
import { OperationsActions } from '../../domains/operations/state/operations.actions';
import {
  selectDashboardOperationsViewModel,
  selectOperationsAnalyticsData,
  selectOperationsLineOptions,
} from '../../domains/operations/state/operations.selectors';
import { KpiBand } from '../../shared/ui/kpi-band/kpi-band';
import { OverviewAnalytics } from './components/overview-analytics/overview-analytics';
import { OverviewFilters } from './components/overview-filters/overview-filters';
import { createOverviewChartModels } from './overview-chart-options';

const STATUS_LABELS: Record<LineStatus, string> = {
  operational: 'Operativa',
  reduced: 'Rendimiento reducido',
  stopped: 'Parada',
  noData: 'Sin datos',
};

const STAGE_CODES: Record<string, string> = {
  Corte: '01',
  Conformado: '02',
  Soldadura: '03',
  Acabado: '04',
};

@Component({
  imports: [DatePipe, KpiBand, OverviewAnalytics, OverviewFilters, RouterLink],
  selector: 'app-overview',
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly analyticsData = this.store.selectSignal(selectOperationsAnalyticsData);

  protected readonly filters = this.store.selectSignal(selectDashboardFilters);
  protected readonly lineOptions = this.store.selectSignal(selectOperationsLineOptions);
  protected readonly viewModel = this.store.selectSignal(selectDashboardOperationsViewModel);
  protected readonly chartModels = computed(() => {
    const data = this.analyticsData();
    return data ? createOverviewChartModels(data) : null;
  });

  ngOnInit(): void {
    this.store.dispatch(OperationsActions.enterOverview());
  }

  ngOnDestroy(): void {
    this.store.dispatch(OperationsActions.leaveOverview());
  }

  protected updateFilters(filters: DashboardFilters): void {
    this.store.dispatch(OperationsActions.updateFilters({ filters }));
  }

  protected loadOverview(): void {
    this.store.dispatch(OperationsActions.refreshOverview());
  }

  protected statusLabel(status: LineStatus): string {
    return STATUS_LABELS[status];
  }

  protected stageCode(stageName: string): string {
    return STAGE_CODES[stageName] ?? '--';
  }
}
