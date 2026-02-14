import { Routes } from '@angular/router';

export const bookingRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/Home/booking.component').then((m) => m.BookingComponent),
  },
];
