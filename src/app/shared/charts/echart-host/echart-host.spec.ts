import { TestBed } from '@angular/core/testing';
import { EChartsCoreOption, EChartsType } from 'echarts/core';
import { vi } from 'vitest';
import { EchartHost } from './echart-host';
import { EchartsEngine } from './echarts-engine';

describe('EchartHost', () => {
  const chart = {
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
  } as unknown as EChartsType;
  const engine = { create: vi.fn(() => chart) };
  let resizeCallback: ResizeObserverCallback;
  const observe = vi.fn();
  const disconnect = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = callback;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    await TestBed.configureTestingModule({
      imports: [EchartHost],
      providers: [{ provide: EchartsEngine, useValue: engine }],
    }).compileComponents();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('initializes, updates, resizes and disposes the chart instance', () => {
    const firstOption: EChartsCoreOption = { xAxis: { type: 'category' }, series: [] };
    const nextOption: EChartsCoreOption = { xAxis: { type: 'value' }, series: [] };
    const fixture = TestBed.createComponent(EchartHost);
    fixture.componentRef.setInput('option', firstOption);
    fixture.componentRef.setInput('summary', 'Tendencia OEE del turno.');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(engine.create).toHaveBeenCalledOnce();
    expect(chart.setOption).toHaveBeenCalledWith(firstOption, { notMerge: true });
    expect(host.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      'Tendencia OEE del turno.',
    );

    fixture.componentRef.setInput('option', nextOption);
    fixture.detectChanges();
    expect(chart.setOption).toHaveBeenLastCalledWith(nextOption, { notMerge: true });

    resizeCallback([], {} as ResizeObserver);
    expect(chart.resize).toHaveBeenCalledOnce();

    fixture.destroy();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(chart.dispose).toHaveBeenCalledOnce();
  });
});
