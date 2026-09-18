import { Component, input } from '@angular/core';
import { EchartHost } from '../../../../shared/charts/echart-host/echart-host';
import { OverviewChartModels } from '../../overview-chart-options';

@Component({
  imports: [EchartHost],
  selector: 'app-overview-analytics',
  styleUrl: './overview-analytics.scss',
  templateUrl: './overview-analytics.html',
})
export class OverviewAnalytics {
  readonly models = input.required<OverviewChartModels>();
}
