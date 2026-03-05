import { Routes } from '@angular/router';
import { HotelDetailsComponent } from './pages/hotel-details/hotel-details.component';

export const HOTEL_DETAILS_ROUTES: Routes = [
  {
    path: '',
    component: HotelDetailsComponent,
    data: { breadcrumb: 'Hotel Integration' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/hotel-detail-view/hotel-detail-view.component').then(
        (m) => m.HotelDetailViewComponent
      ),
    data: { breadcrumb: 'Hotel Details' },
  },
  {
    path: ':id/trip/:tripId',
    loadComponent: () =>
      import('./pages/trip-detail/trip-detail.component').then(
        (m) => m.TripDetailComponent
      ),
    data: { breadcrumb: 'Trip Details' },
  },
];
