import { Component, input } from '@angular/core';

export type KpiTone = 'neutral' | 'positive' | 'warning' | 'critical';

export interface KpiDisplayItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly supportingText: string;
  readonly tone: KpiTone;
}

@Component({
  selector: 'app-kpi-band',
  styleUrl: './kpi-band.scss',
  templateUrl: './kpi-band.html',
})
export class KpiBand {
  readonly items = input.required<readonly KpiDisplayItem[]>();
}
