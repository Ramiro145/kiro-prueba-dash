import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { LineDetailActions } from '../../domains/operations/state/line-detail.actions';
import {
  selectLineDetailContext,
  selectLineDetailViewModel,
} from '../../domains/operations/state/line-detail.selectors';
import { KpiBand } from '../../shared/ui/kpi-band/kpi-band';

@Component({
  imports: [DatePipe, KpiBand, RouterLink],
  selector: 'app-line-detail',
  styleUrl: './line-detail.scss',
  templateUrl: './line-detail.html',
})
export class LineDetail implements OnDestroy {
  private readonly store = inject(Store);

  protected readonly context = this.store.selectSignal(selectLineDetailContext);
  protected readonly viewModel = this.store.selectSignal(selectLineDetailViewModel);
  protected readonly backQueryParams = computed(() => {
    const context = this.context();
    return context ? { plant: context.plantId, shift: context.shiftId, line: context.lineId } : {};
  });

  constructor() {
    effect(() => {
      const context = this.context();
      if (context) {
        this.store.dispatch(
          LineDetailActions.load({ lineId: context.lineId, shiftId: context.shiftId }),
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(LineDetailActions.clear());
  }

  protected retry(): void {
    const context = this.context();
    if (context) {
      this.store.dispatch(
        LineDetailActions.load({ lineId: context.lineId, shiftId: context.shiftId }),
      );
    }
  }
}
