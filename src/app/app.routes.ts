import { Routes } from '@angular/router';
import { AppShell } from './layout/app-shell/app-shell';

export const routes: Routes = [
  {
    path: '',
    component: AppShell,
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import('./features/overview/overview').then(({ Overview }) => Overview),
        title: 'Resumen de planta | Acero Control',
      },
      {
        path: 'lines/:lineId',
        loadComponent: () =>
          import('./features/line-detail/line-detail').then(({ LineDetail }) => LineDetail),
        title: 'Detalle de línea | Acero Control',
      },
      {
        path: 'alerts',
        loadComponent: () => import('./features/alerts/alerts').then(({ Alerts }) => Alerts),
        title: 'Centro de alertas | Acero Control',
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'overview',
  },
];
