// Top-level routes — features are lazy-loaded inside the layout shell
import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';

import { LayoutAdminComponent } from './shared/components/layout-admin/layout-admin.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
  // {
  //   path: '',
  //   component: LayoutAdminComponent,
  //   children: [
  //     {
  //       path: 'home',
  //       data: { breadcrumb: 'Dashboard', icon: 'dashboard' },
  //       loadChildren: () =>
  //         import('./features/admin-dashboard/admin-dashboard.routes').then((m) => m.adminDashboardRoutes),
  //     },
  //     { path: '', redirectTo: 'home', pathMatch: 'full' },
  //   ],
  // },
  // {
  //   path: 'demo',
  //   component: LayoutComponent,
  //   children: [
  //     {
  //       path: 'demo',
  //       data: { breadcrumb: $localize`:@@breadcrumb.products:Products` },
  //       loadChildren: () =>
  //         import('./features/demo/demo.routes').then((m) => m.demoRoutes),
  //     },
  //     {
  //       path: 'users',
  //       data: { breadcrumb: $localize`:@@breadcrumb.users:Users` },
  //       loadChildren: () =>
  //         import('./features/users/users.routes').then((m) => m.usersRoutes),
  //     },
  //     {
  //       path: 'showcase',
  //       data: { breadcrumb: $localize`:@@breadcrumb.showcase:Showcase` },
  //       loadChildren: () =>
  //         import('./features/showcase/showcase.routes').then((m) => m.showcaseRoutes),
  //     },
  //     // { path: '', redirectTo: 'demo', pathMatch: 'full' },
  //   ],
  // },
  {
    path: '',
    component: LayoutAdminComponent,
    children: [
      {
        path: 'dashboard',
        data: { breadcrumb: 'Dashboard', icon: 'dashboard' },
        loadComponent: () =>
          import('./features/admin-dashboard/pages/home/home-component').then((m) => m.HomeComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' as const },
    ],
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  { path: '**', component: NotFoundComponent },
];
