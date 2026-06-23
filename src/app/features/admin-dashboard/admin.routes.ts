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
];
