// Top-level routes — features are lazy-loaded inside the layout shell
import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { LayoutBookingComponent } from './shared/components/layout-booking/layout-booking.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { DefaultPageComponent } from './core/components/default-page/default-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutBookingComponent,
    data: { breadcrumb: $localize`:@@breadcrumb.booking:Booking` },
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./features/booking/booking.routes').then((m) => m.bookingRoutes),
      },
      {
        path: 'RiderHistory',
        canActivate: [authGuard, roleGuard(['passenger'])],
        loadChildren: () =>
          import('./features/RiderHistory/RiderHistory.routes').then((m) => m.RiderHistoryRoutes),
      },
      {
        path: 'TripDetails',
        canActivate: [authGuard, roleGuard(['passenger', 'admin'])],
        loadChildren: () =>
          import('./features/TripDetails/tripDetails.routs').then((m) => m.tripDetailsRoutes),
      },
      {
        path: 'FinancialHistory',
        canActivate: [authGuard, roleGuard(['passenger', 'admin'])],
        loadChildren: () =>
          import('./features/financial-history/financial-history-routes').then((m) => m.financialHistoryRoutes),
      },
      {
        path: 'profile',
        canActivate: [authGuard, roleGuard(['passenger'])],
        loadChildren: () =>
          import('./features/Profile/Profile.routs').then((m) => m.ProfileRoutes),
      },
      {
        path: 'hotel-details',
        canActivate: [authGuard, roleGuard(['admin', 'hotel'])],
        loadChildren: () =>
          import('./features/hotel-details/hotel-details.routes').then((m) => m.HOTEL_DETAILS_ROUTES),
      },
      {
        path: 'admin',
        canActivate: [authGuard, roleGuard(['admin'])],
        loadChildren: () =>
          import('./features/admin-dashboard/admin.routes').then((m) => m.Admin_ROUTES),
      },
      { path: '', component: DefaultPageComponent, pathMatch: 'full' },
    ],
  },
  {
    path: 'demo',
    component: LayoutComponent,
    children: [
      {
        path: 'demo',
        data: { breadcrumb: $localize`:@@breadcrumb.products:Products` },
        loadChildren: () =>
          import('./features/demo/demo.routes').then((m) => m.demoRoutes),
      },
      {
        path: 'users',
        data: { breadcrumb: $localize`:@@breadcrumb.users:Users` },
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.usersRoutes),
      },
      {
        path: 'showcase',
        data: { breadcrumb: $localize`:@@breadcrumb.showcase:Showcase` },
        loadChildren: () =>
          import('./features/showcase/showcase.routes').then((m) => m.showcaseRoutes),
      },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
