import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { LineStatus } from '../../domains/operations/models/operations.models';
import { OperationsActions } from '../../domains/operations/state/operations.actions';
import {
  selectOperationsAnalyticsData,
  selectOperationsViewModel,
} from '../../domains/operations/state/operations.selectors';
import { KpiBand } from '../../shared/ui/kpi-band/kpi-band';
import { OverviewAnalytics } from './components/overview-analytics/overview-analytics';
import { createOverviewChartModels } from './overview-chart-options';

const DEFAULT_PLANT_ID = 'plant-north';
const DEFAULT_SHIFT_ID = 'morning';

const STATUS_LABELS: Record<LineStatus, string> = {
  operational: 'Operativa',
  reduced: 'Rendimiento reducido',
  stopped: 'Parada',
  noData: 'Sin datos',
};

@Component({
  imports: [DatePipe, KpiBand, OverviewAnalytics, RouterLink],
  selector: 'app-overview',
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview implements OnInit {
  private readonly store = inject(Store);
  private readonly analyticsData = this.store.selectSignal(selectOperationsAnalyticsData);

  protected readonly viewModel = this.store.selectSignal(selectOperationsViewModel);
  protected readonly chartModels = computed(() => {
    const data = this.analyticsData();
    return data ? createOverviewChartModels(data) : null;
  });

  ngOnInit(): void {
    this.loadOverview();
  }

  protected loadOverview(): void {
    this.store.dispatch(
      OperationsActions.loadOverview({
        plantId: DEFAULT_PLANT_ID,
        shiftId: DEFAULT_SHIFT_ID,
      }),
    );
  }

  protected statusLabel(status: LineStatus): string {
    return STATUS_LABELS[status];
  }
}
