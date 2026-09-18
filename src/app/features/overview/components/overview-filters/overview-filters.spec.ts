import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { OverviewFilters } from './overview-filters';

describe('OverviewFilters', () => {
  it('emits a complete filter set when the selected line changes', async () => {
    await TestBed.configureTestingModule({ imports: [OverviewFilters] }).compileComponents();
    const fixture = TestBed.createComponent(OverviewFilters);
    fixture.componentRef.setInput('filters', {
      plantId: 'plant-north',
      shiftId: 'morning',
      lineId: null,
    });
    fixture.componentRef.setInput('lines', [
      { id: 'cutting-01', name: 'Corte 01' },
      { id: 'welding-01', name: 'Soldadura 01' },
    ]);
    const changed = vi.fn();
    fixture.componentInstance.filtersChange.subscribe(changed);
    fixture.detectChanges();
    const select = (fixture.nativeElement as HTMLElement).querySelector<HTMLSelectElement>(
      '[data-testid="line-filter"]',
    );

    select!.value = 'welding-01';
    select!.dispatchEvent(new Event('change'));

    expect(changed).toHaveBeenCalledWith({
      plantId: 'plant-north',
      shiftId: 'morning',
      lineId: 'welding-01',
    });
  });
});
