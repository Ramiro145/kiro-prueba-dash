import { Injectable } from '@angular/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  AriaComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { EChartsType, init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

use([
  LineChart,
  BarChart,
  AriaComponent,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
]);

@Injectable({ providedIn: 'root' })
export class EchartsEngine {
  create(element: HTMLElement): EChartsType {
    return init(element, undefined, { renderer: 'canvas' });
  }
}
