// Top-level routes — features are lazy-loaded inside the layout shell
import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'booking',
    data: { breadcrumb: $localize`:@@breadcrumb.booking:Booking` },
    loadChildren: () =>
      import('./features/booking/booking.routes').then((m) => m.bookingRoutes),
  },
  {
    path: '',
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
      { path: '', redirectTo: 'demo', pathMatch: 'full' },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
