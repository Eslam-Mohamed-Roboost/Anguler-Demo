import { Routes } from '@angular/router';

export const tripDetailsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/trip-details/trip-details.component').then((m) => m.TripDetailsComponent),
  },
];
