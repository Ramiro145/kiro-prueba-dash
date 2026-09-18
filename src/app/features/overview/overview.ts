import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { OperationsActions } from '../../domains/operations/state/operations.actions';
import { selectOperationsViewModel } from '../../domains/operations/state/operations.selectors';
import { LineStatus } from '../../domains/operations/models/operations.models';

const DEFAULT_PLANT_ID = 'plant-north';
const DEFAULT_SHIFT_ID = 'morning';

const STATUS_LABELS: Record<LineStatus, string> = {
  operational: 'Operativa',
  reduced: 'Rendimiento reducido',
  stopped: 'Parada',
  noData: 'Sin datos',
};

@Component({
  imports: [DatePipe],
  selector: 'app-overview',
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview implements OnInit {
  private readonly store = inject(Store);

  protected readonly viewModel = this.store.selectSignal(selectOperationsViewModel);

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
