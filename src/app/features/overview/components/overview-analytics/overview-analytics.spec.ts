import { TestBed } from '@angular/core/testing';
import { EChartsType } from 'echarts/core';
import { vi } from 'vitest';
import { EchartsEngine } from '../../../../shared/charts/echart-host/echarts-engine';
import { OverviewChartModels } from '../../overview-chart-options';
import { OverviewAnalytics } from './overview-analytics';

const chart = {
  setOption: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
} as unknown as EChartsType;

const models: OverviewChartModels = {
  oee: { eyebrow: 'Eficiencia', title: 'Tendencia OEE', summary: 'Resumen OEE', option: {} },
  production: {
    eyebrow: 'Producción',
    title: 'Producción por hora',
    summary: 'Resumen de producción',
    option: {},
  },
  downtime: {
    eyebrow: 'Pérdidas',
    title: 'Pareto de paros',
    summary: 'Resumen de paros',
    option: {},
  },
};

describe('OverviewAnalytics', () => {
  it('renders the three analytical panels and their chart hosts', async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewAnalytics],
      providers: [{ provide: EchartsEngine, useValue: { create: () => chart } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(OverviewAnalytics);
    fixture.componentRef.setInput('models', models);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.analytics-panel')).toHaveLength(3);
    expect(element.querySelectorAll('app-echart')).toHaveLength(3);
    expect(element.textContent).toContain('Tendencia OEE');
    expect(element.textContent).toContain('Producción por hora');
    expect(element.textContent).toContain('Pareto de paros');
  });
});
