import { Component } from '@angular/core';

interface ProcessStage {
  readonly code: string;
  readonly name: string;
}

@Component({
  selector: 'app-overview',
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  protected readonly stages: readonly ProcessStage[] = [
    { code: '01', name: 'Corte' },
    { code: '02', name: 'Conformado' },
    { code: '03', name: 'Soldadura' },
    { code: '04', name: 'Acabado' },
  ];
}
