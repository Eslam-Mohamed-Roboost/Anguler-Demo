// Centralized notification state — supports stacked, multi-type toasts with auto-dismiss
import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private nextId = 1;
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();
  readonly hasNotifications = computed(() => this._notifications().length > 0);

  /**
   * Show a notification toast. Auto-dismissed after `durationMs`.
   * Pass `0` for durationMs to disable auto-dismiss.
   */
  show(type: NotificationType, message: string, durationMs = 5000): number {
    const id = this.nextId++;
    this._notifications.update((list) => [...list, { id, type, message }]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }

    return id;
  }

  showSuccess(message: string, durationMs = 4000): number {
    return this.show('success', message, durationMs);
  }

  showError(message: string, durationMs = 6000): number {
    return this.show('error', message, durationMs);
  }

  showWarning(message: string, durationMs = 5000): number {
    return this.show('warning', message, durationMs);
  }

  showInfo(message: string, durationMs = 5000): number {
    return this.show('info', message, durationMs);
  }

  dismiss(id: number): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  clearAll(): void {
    this._notifications.set([]);
  }
}
