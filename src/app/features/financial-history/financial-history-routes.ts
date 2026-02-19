import { Routes } from '@angular/router';

export const financialHistoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./Components/financial-history/financial-history.component').then((m) => m.FinancialHistoryComponent),
  },
];
