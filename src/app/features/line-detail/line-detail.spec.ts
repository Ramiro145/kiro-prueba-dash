import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { vi } from 'vitest';
import { LineDetailActions } from '../../domains/operations/state/line-detail.actions';
import {
  LineDetailContext,
  LineDetailViewModel,
  selectLineDetailContext,
  selectLineDetailViewModel,
} from '../../domains/operations/state/line-detail.selectors';
import { LineDetail } from './line-detail';

const context: LineDetailContext = {
  lineId: 'welding-01',
  plantId: 'plant-north',
  shiftId: 'morning',
};

const readyViewModel: LineDetailViewModel = {
  status: 'ready',
  lineName: 'Soldadura 01',
  stageName: 'Soldadura',
  lineStatus: 'stopped',
  statusLabel: 'Parada',
  activeOrder: 'OT-260918-037',
  shiftName: 'Turno mañana',
  updatedAt: '2026-09-18T12:00:00.000Z',
  error: null,
  kpis: [],
  productionByHour: [{ hour: '07:00', actual: '52', target: '80' }],
  statusTimeline: [
    { status: 'stopped', statusLabel: 'Parada', startedAt: '10:48', endedAt: 'En curso' },
  ],
  downtimeEvents: [
    { id: 'down-01', reason: 'Ajuste de soldadura', startedAt: '10:48', durationLabel: '58 min' },
  ],
  qualityDefects: [{ category: 'Cordón irregular', count: 12, percentageLabel: '41.0%' }],
  events: [{ id: 'event-01', timestamp: '10:48', message: 'Paro por ajuste de soldadura' }],
};

describe('LineDetail', () => {
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineDetail],
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [
            { selector: selectLineDetailContext, value: context },
            { selector: selectLineDetailViewModel, value: readyViewModel },
          ],
        }),
      ],
    }).compileComponents();
    store = TestBed.inject(MockStore);
  });

  it('loads and renders the operational line workspace', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(LineDetail);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(dispatch).toHaveBeenCalledWith(
      LineDetailActions.load({ lineId: 'welding-01', shiftId: 'morning' }),
    );
    expect(element.querySelector('h1')?.textContent).toContain('Soldadura 01');
    expect(element.textContent).toContain('OT-260918-037');
    expect(element.textContent).toContain('Producción por hora');
    expect(element.textContent).toContain('Paros');
    expect(element.textContent).toContain('Calidad');
    expect(element.textContent).toContain('Historial');
  });

  it('returns to overview with the active filter context', () => {
    const fixture = TestBed.createComponent(LineDetail);
    fixture.detectChanges();
    const backLink = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      '[data-testid="back-to-overview"]',
    );

    expect(backLink?.getAttribute('href')).toBe(
      '/overview?plant=plant-north&shift=morning&line=welding-01',
    );
  });

  it('renders a specific not-found state', () => {
    store.overrideSelector(selectLineDetailViewModel, {
      ...readyViewModel,
      status: 'notFound',
      lineName: null,
      error: 'Línea no encontrada.',
    });
    const fixture = TestBed.createComponent(LineDetail);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('Línea no encontrada');
  });
});
