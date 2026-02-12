// Demo feature routes — lazy loaded
import { Routes } from '@angular/router';

export const demoRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/product-list/product-list.component').then(
        (m) => m.ProductListComponent,
      ),
  },
  {
    path: 'new',
    data: { breadcrumb: $localize`:@@breadcrumb.newProduct:New Product` },
    loadComponent: () =>
      import('./components/product-form/product-form.component').then(
        (m) => m.ProductFormComponent,
      ),
  },
  {
    path: ':id/edit',
    data: { breadcrumb: $localize`:@@breadcrumb.editProduct:Edit Product` },
    loadComponent: () =>
      import('./components/product-form/product-form.component').then(
        (m) => m.ProductFormComponent,
      ),
  },
];
