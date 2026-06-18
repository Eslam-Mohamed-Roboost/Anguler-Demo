import { Routes } from '@angular/router';

export const Admin_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/pending-requests/pending-requests.component').then(
        (m) => m.PendingRequestsComponent,
      ),
    data: { breadcrumb: 'Pending Requests' },
  },
  {
    path: 'hotels-summary',
    loadComponent: () =>
      import('./components/hotels-summary/hotels-summary.component').then(
        (m) => m.HotelsSummaryComponent,
      ),
    data: { breadcrumb: 'Hotels Summary' },
  },
  {
    path: 'trip/:id',
    loadComponent: () =>
      import('../TripDetails/components/trip-details/trip-details.component').then(
        (m) => m.TripDetailsComponent,
      ),
    data: { breadcrumb: 'Trip Details' },
  },
];
