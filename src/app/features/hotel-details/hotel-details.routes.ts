import { Routes } from '@angular/router';
import { HotelDashboardComponent } from './pages/hotel-dashboard/hotel-dashboard.component';

export const HOTEL_DETAILS_ROUTES: Routes = [
  {
    path: '',
    component: HotelDashboardComponent,
    data: { breadcrumb: 'Hotel Integration' },
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
  {
    path: ':id/trip/:tripId',
    loadComponent: () =>
      import('./pages/hotel-trip-detail/hotel-trip-detail.component').then(
        (m) => m.HotelTripDetailComponent
      ),
    data: { breadcrumb: 'Trip Detail' },
  },
];
