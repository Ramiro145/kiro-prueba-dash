import { WELDING_LINE_DETAIL } from '../../../core/mock-api/line-detail.fixtures';
import { DEFAULT_DASHBOARD_FILTERS } from './dashboard-filters.selectors';
import { initialLineDetailState } from './line-detail.reducer';
import { selectLineDetailContext, selectLineDetailViewModel } from './line-detail.selectors';

describe('line detail selectors', () => {
  it('combines the route identifier with shared URL filters', () => {
    expect(
      selectLineDetailContext.projector('welding-01', {
        ...DEFAULT_DASHBOARD_FILTERS,
        shiftId: 'night',
        lineId: 'welding-01',
      }),
    ).toEqual({
      lineId: 'welding-01',
      plantId: 'plant-north',
      shiftId: 'night',
    });
  });

  it('maps line detail to a complete presentation model', () => {
    const viewModel = selectLineDetailViewModel.projector({
      ...initialLineDetailState,
      data: WELDING_LINE_DETAIL,
    });

    expect(viewModel.status).toBe('ready');
    expect(viewModel.lineName).toBe('Soldadura 01');
    expect(viewModel.statusLabel).toBe('Parada');
    expect(viewModel.kpis.find(({ id }) => id === 'oee')?.value).toBe('61.0%');
    expect(viewModel.productionByHour).toHaveLength(6);
    expect(viewModel.downtimeEvents[0].durationLabel).toBe('58 min');
    expect(viewModel.qualityDefects[0].percentageLabel).toBe('41.0%');
  });

  it('preserves unavailable measurements as dashes', () => {
    const viewModel = selectLineDetailViewModel.projector({
      ...initialLineDetailState,
      data: {
        ...WELDING_LINE_DETAIL,
        metrics: { oee: null, availability: null, performance: null, quality: null },
        snapshot: {
          ...WELDING_LINE_DETAIL.snapshot,
          producedUnits: null,
          targetUnits: null,
          goodUnits: null,
          scrapUnits: null,
          downtimeMinutes: null,
        },
      },
    });

    expect(viewModel.kpis.every(({ value }) => !value.includes('NaN'))).toBe(true);
    expect(viewModel.kpis.find(({ id }) => id === 'oee')?.value).toBe('—');
  });

  it('returns empty for a valid line without operational measurements', () => {
    const viewModel = selectLineDetailViewModel.projector({
      ...initialLineDetailState,
      data: {
        ...WELDING_LINE_DETAIL,
        line: { ...WELDING_LINE_DETAIL.line, status: 'noData' },
        metrics: { oee: null, availability: null, performance: null, quality: null },
        snapshot: {
          ...WELDING_LINE_DETAIL.snapshot,
          producedUnits: null,
          targetUnits: null,
          goodUnits: null,
          scrapUnits: null,
          downtimeMinutes: null,
        },
        productionByHour: WELDING_LINE_DETAIL.productionByHour.map((point) => ({
          ...point,
          actualUnits: null,
          targetUnits: null,
        })),
        statusTimeline: [
          {
            status: 'noData',
            startedAt: '2026-09-18T06:00:00.000Z',
            endedAt: null,
          },
        ],
        downtimeEvents: [],
        qualityDefects: [],
        events: [],
      },
    });

    expect(viewModel.status).toBe('empty');
  });

  it('returns a dedicated not-found model', () => {
    const viewModel = selectLineDetailViewModel.projector({
      ...initialLineDetailState,
      errorKind: 'notFound',
      error: 'Línea no encontrada.',
    });

    expect(viewModel.status).toBe('notFound');
    expect(viewModel.error).toBe('Línea no encontrada.');
  });
});
