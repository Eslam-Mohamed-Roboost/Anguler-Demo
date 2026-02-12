/**
 * Route guard that warns users about unsaved form changes before navigating away.
 *
 * Components that use this guard must implement the `FormDirtyCheck` interface.
 *
 * Usage in routes:
 *   {
 *     path: ':id/edit',
 *     loadComponent: () => import('./product-form.component').then(m => m.ProductFormComponent),
 *     canDeactivate: [formDirtyGuard],
 *   }
 *
 * Usage in component:
 *   export class ProductFormComponent implements FormDirtyCheck {
 *     isFormDirty(): boolean {
 *       return this.form.dirty;
 *     }
 *   }
 */
import { inject } from '@angular/core';
import type { CanDeactivateFn } from '@angular/router';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';

/**
 * Interface that components must implement to work with `formDirtyGuard`.
 */
export interface FormDirtyCheck {
  isFormDirty(): boolean;
}

/**
 * Functional guard — checks if the component has unsaved changes.
 * If dirty, shows a confirmation dialog. If the user confirms, navigation proceeds.
 */
export const formDirtyGuard: CanDeactivateFn<FormDirtyCheck> = async (component) => {
  if (!component.isFormDirty || !component.isFormDirty()) {
    return true;
  }

  const confirmDialog = inject(ConfirmDialogService);

  return confirmDialog.confirm({
    title: $localize`:@@guard.dirty.title:Unsaved Changes`,
    message: $localize`:@@guard.dirty.message:You have unsaved changes. Are you sure you want to leave this page?`,
    confirmLabel: $localize`:@@guard.dirty.leave:Leave`,
    cancelLabel: $localize`:@@guard.dirty.stay:Stay`,
    confirmVariant: 'danger',
  });
};
