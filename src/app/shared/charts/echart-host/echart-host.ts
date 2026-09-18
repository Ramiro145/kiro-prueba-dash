import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { EChartsCoreOption, EChartsType } from 'echarts/core';
import { effect } from '@angular/core';
import { EchartsEngine } from './echarts-engine';

@Component({
  selector: 'app-echart',
  styleUrl: './echart-host.scss',
  templateUrl: './echart-host.html',
})
export class EchartHost implements AfterViewInit, OnDestroy {
  readonly option = input.required<EChartsCoreOption>();
  readonly summary = input.required<string>();

  private readonly chartElement = viewChild.required<ElementRef<HTMLElement>>('chart');
  private readonly engine = inject(EchartsEngine);
  private readonly document = inject(DOCUMENT);
  private chart: EChartsType | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      const option = this.option();
      this.chart?.setOption(option, { notMerge: true });
    });
  }

  ngAfterViewInit(): void {
    this.chart = this.engine.create(this.chartElement().nativeElement);
    this.chart.setOption(this.option(), { notMerge: true });
    this.observeContainer();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
    this.chart = null;
  }

  private observeContainer(): void {
    const ResizeObserverConstructor = this.document.defaultView?.ResizeObserver;
    if (!ResizeObserverConstructor) {
      return;
    }

    this.resizeObserver = new ResizeObserverConstructor(() => this.chart?.resize());
    this.resizeObserver.observe(this.chartElement().nativeElement);
  }
}
