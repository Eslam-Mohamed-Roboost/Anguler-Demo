import { Routes } from '@angular/router';

export const RiderHistoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/rider-history/rider-history.component').then((m) => m.RiderHistoryComponent),
  },
];
