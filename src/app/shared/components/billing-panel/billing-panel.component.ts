import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import {
  NotificationItem,
  NotificationsService,
} from '../../../core/services/notifications.service';
import { AuthService } from '../../../core/services/auth.service';

const NOTIFICATION_REFRESH_MS = 5_000;

export interface  BillingItem{
  id: string;
  message: string;
  createdDate: string;
  isRead: boolean;
}
@Component({
  selector: 'app-billing-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe],
  templateUrl: './billing-panel.component.html',
})
export class BillingPanelComponent {
  private readonly notificationsService = inject(NotificationsService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = input<boolean>(false);
  readonly closePanel = output<void>();
  readonly notificationRead = output<void>();
  readonly billingItems = input<BillingItem[]>([]);

  protected readonly notifications = signal<NotificationItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly UnreadCount = signal(0);

  constructor() {
    effect(() => {
      if (this.isOpen() && this.authService.isAuthenticated()) {
        this.loadNotifications();
        this.UnreadNotificationsCount();
      }
    });

    timer(NOTIFICATION_REFRESH_MS, NOTIFICATION_REFRESH_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.isOpen() || !this.authService.isAuthenticated()) return;

        this.loadNotifications(false, true);
        this.UnreadNotificationsCount(true);
      });
  }

  private loadNotifications(showLoading = true, skipGlobalLoading = false): void {
    if (showLoading) this.loading.set(true);
    this.error.set(null);
    this.notificationsService.getAll(skipGlobalLoading).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        if (showLoading) this.loading.set(false);
        if (result.isSuccess && result.data) {
          this.notifications.set(result.data.notifications.items);
        } else {
          this.error.set(result.error?.description ?? 'Failed to load notifications');
        }
      },
      error: () => {
        if (showLoading) this.loading.set(false);
        this.error.set('Failed to load notifications');
      },
    });
  }
  private UnreadNotificationsCount(skipGlobalLoading = false): number {
    this.notificationsService.UnreadNotificationsCount(skipGlobalLoading).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data !== undefined) {
          this.UnreadCount.set(result.data?.count??0);
          return result.data;
        } else {
          return 0;
        }
      },
      error: () => {
        return 0;
      },
    });
    return 0; // Default return value while waiting for the async call
  }
  protected onClose(): void {
    this.closePanel.emit();
  }

  protected onNotificationClick(item: NotificationItem): void {
    if (item.isRead) return;

    this.notifications.update((items) =>
      items.map((notification) =>
        notification.id === item.id ? { ...notification, isRead: true } : notification,
      ),
    );
    this.UnreadCount.update((count) => Math.max(0, count - 1));

    this.notificationsService.markAsRead(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        if (result.isSuccess) {
          this.refreshUnreadCount();
          this.notificationRead.emit();
          return;
        }

        this.restoreUnreadNotification(item.id);
      },
      error: () => this.restoreUnreadNotification(item.id),
    });
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private refreshUnreadCount(): void {
    this.notificationsService.UnreadNotificationsCount().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        if (result.isSuccess) {
          this.UnreadCount.set(result.data?.count ?? 0);
        }
      },
    });
  }

  private restoreUnreadNotification(id: string): void {
    this.notifications.update((items) =>
      items.map((notification) =>
        notification.id === id ? { ...notification, isRead: false } : notification,
      ),
    );
    this.refreshUnreadCount();
  }
}
