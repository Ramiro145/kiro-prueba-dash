import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { vi } from 'vitest';
import { OperationsActions } from '../../domains/operations/state/operations.actions';
import {
  OperationsViewModel,
  selectOperationsViewModel,
} from '../../domains/operations/state/operations.selectors';
import { Overview } from './overview';

const readyViewModel: OperationsViewModel = {
  status: 'ready',
  plantName: 'Planta Norte',
  location: 'Monterrey, NL',
  shiftName: 'Turno mañana',
  updatedAt: '2026-09-18T12:00:00.000Z',
  error: null,
  kpis: [
    {
      id: 'oee',
      label: 'OEE',
      value: '78.0%',
      supportingText: 'Meta ≥ 85.0%',
      tone: 'warning',
    },
  ],
  lines: [
    { id: 'cutting-01', name: 'Corte 01', stageName: 'Corte', status: 'operational' },
    { id: 'forming-01', name: 'Conformado 01', stageName: 'Conformado', status: 'reduced' },
    { id: 'welding-01', name: 'Soldadura 01', stageName: 'Soldadura', status: 'stopped' },
    { id: 'finishing-01', name: 'Acabado 01', stageName: 'Acabado', status: 'noData' },
  ],
};

describe('Overview', () => {
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Overview],
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [{ selector: selectOperationsViewModel, value: readyViewModel }],
        }),
      ],
    }).compileComponents();
    store = TestBed.inject(MockStore);
  });

  it('requests and presents the operational dashboard', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(dispatch).toHaveBeenCalledWith(
      OperationsActions.loadOverview({ plantId: 'plant-north', shiftId: 'morning' }),
    );
    expect(element.querySelector('[data-testid="plant-name"]')?.textContent).toContain(
      'Planta Norte',
    );
    expect(element.querySelector('[data-testid="kpi-item"]')?.textContent).toContain('78.0%');
    expect(element.textContent).toContain('Corte');
    expect(element.textContent).toContain('Conformado');
    expect(element.textContent).toContain('Soldadura');
    expect(element.textContent).toContain('Acabado');
  });

  it('links every process stage to its line detail with an accessible label', () => {
    const fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const firstLine = element.querySelector<HTMLAnchorElement>('.process__stage');

    expect(firstLine?.getAttribute('href')).toBe('/lines/cutting-01');
    expect(firstLine?.getAttribute('aria-label')).toBe('Ver detalle de Corte 01, estado Operativa');
  });

  it('presents an accessible loading state', () => {
    store.overrideSelector(selectOperationsViewModel, {
      ...readyViewModel,
      status: 'loading',
      plantName: null,
      location: null,
      lines: [],
      kpis: [],
    });
    const fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="status"]')?.textContent,
    ).toContain('Cargando');
  });

  it('presents an accessible initial error state', () => {
    store.overrideSelector(selectOperationsViewModel, {
      ...readyViewModel,
      status: 'error',
      plantName: null,
      location: null,
      lines: [],
      kpis: [],
      error: 'No se pudo cargar el resumen de planta.',
    });
    const fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('No se pudo cargar');
  });
});
