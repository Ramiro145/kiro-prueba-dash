import { Component, input, output } from '@angular/core';
import { DashboardFilters } from '../../../../domains/operations/state/dashboard-filters.selectors';

export interface LineFilterOption {
  readonly id: string;
  readonly name: string;
}

@Component({
  selector: 'app-overview-filters',
  styleUrl: './overview-filters.scss',
  templateUrl: './overview-filters.html',
})
export class OverviewFilters {
  readonly filters = input.required<DashboardFilters>();
  readonly lines = input.required<readonly LineFilterOption[]>();
  readonly filtersChange = output<DashboardFilters>();

  protected changePlant(event: Event): void {
    this.emit({ plantId: this.valueOf(event) });
  }

  protected changeShift(event: Event): void {
    this.emit({ shiftId: this.valueOf(event) });
  }

  protected changeLine(event: Event): void {
    this.emit({ lineId: this.valueOf(event) || null });
  }

  private emit(changes: Partial<DashboardFilters>): void {
    this.filtersChange.emit({ ...this.filters(), ...changes });
  }

  private valueOf(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }
}
