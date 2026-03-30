import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    data: { illustration: 'login' },
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    data: { illustration: 'forgot-password' },
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
   {
    path: 'verify-code',
    data: { illustration: 'verify-code' },
    loadComponent: () =>
      import('./pages/verify-code/verify-code.component').then((m) => m.VerifyCodeComponent),
  },
  {
    path: 'Change-password',
    data: { illustration: 'Change-password' },
    loadComponent: () =>
      import('./pages/set-a-password/set-a-password.component').then((m) => m.SetAPasswordComponent),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
