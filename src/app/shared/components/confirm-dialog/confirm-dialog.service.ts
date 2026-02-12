// Programmatic confirmation dialog — eliminates boilerplate modal signals in list components
import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
}

export interface ConfirmState extends ConfirmOptions {
  resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly _state = signal<ConfirmState | null>(null);
  readonly state = this._state.asReadonly();

  /**
   * Opens a confirmation dialog and returns a Promise<boolean>.
   *
   * Usage:
   *   const confirmed = await this.confirmDialog.confirm({
   *     title: 'Delete Product',
   *     message: 'Are you sure?',
   *     confirmVariant: 'danger',
   *   });
   *   if (confirmed) { this.deleteItem(id); }
   */
  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this._state.set({ ...options, resolve });
    });
  }

  accept(): void {
    this._state()?.resolve(true);
    this._state.set(null);
  }

  cancel(): void {
    this._state()?.resolve(false);
    this._state.set(null);
  }
}
