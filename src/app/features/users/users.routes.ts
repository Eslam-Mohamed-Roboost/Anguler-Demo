// Users feature routes — lazy loaded
import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/user-list/user-list.component').then(
        (m) => m.UserListComponent,
      ),
  },
  {
    path: 'new',
    data: { breadcrumb: $localize`:@@breadcrumb.newUser:New User` },
    loadComponent: () =>
      import('./components/user-form/user-form.component').then(
        (m) => m.UserFormComponent,
      ),
  },
  {
    path: ':id/edit',
    data: { breadcrumb: $localize`:@@breadcrumb.editUser:Edit User` },
    loadComponent: () =>
      import('./components/user-form/user-form.component').then(
        (m) => m.UserFormComponent,
      ),
  },
];
