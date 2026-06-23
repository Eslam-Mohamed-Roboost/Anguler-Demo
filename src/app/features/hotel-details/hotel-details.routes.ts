import { Routes } from '@angular/router';

export const HOTEL_DETAILS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/hotel-dashboard/hotel-dashboard.component').then(
        (m) => m.HotelDashboardComponent,
      ),
    data: { breadcrumb: 'Hotel Integration' },
  },
  {
    path: ':id/trip/:tripId',
    loadComponent: () =>
      import('./pages/hotel-trip-detail/hotel-trip-detail.component').then(
        (m) => m.HotelTripDetailComponent
      ),
    data: { breadcrumb: 'Trip Detail' },
  },
  {
    path: 'trip/:tripId',
    loadComponent: () =>
      import('./pages/hotel-trip-detail/hotel-trip-detail.component').then(
        (m) => m.HotelTripDetailComponent
      ),
    data: { breadcrumb: 'Trip Detail' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/hotel-profile/hotel-profile.component').then(
        (m) => m.HotelProfileComponent
      ),
    data: { breadcrumb: 'Hotel Profile' },
  },
];
