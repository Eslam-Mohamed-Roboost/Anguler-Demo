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
import { Router } from '@angular/router';
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
  tripRequestId?: string | null;
  hotelId?: string | null;
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
  private readonly router = inject(Router);

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
    const route = this.tripDetailsRoute(item);

    if (!item.isRead) {
      this.markAsRead(item, route);
      return;
    }

    this.navigateToRoute(route);
  }

  private markAsRead(item: NotificationItem, redirectRoute: string[] | null): void {
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
          this.navigateToRoute(redirectRoute);
          return;
        }

        this.restoreUnreadNotification(item.id);
        this.navigateToRoute(redirectRoute);
      },
      error: () => {
        this.restoreUnreadNotification(item.id);
        this.navigateToRoute(redirectRoute);
      },
    });
  }

  private tripDetailsRoute(item: NotificationItem): string[] | null {
    const tripRequestId = this.cleanId(item.tripRequestId);
    if (!tripRequestId) return null;

    if (this.authService.hasRole('hotel')) {
      return ['/hotel-details', 'trip', tripRequestId];
    }

    if (this.authService.hasRole('admin') || this.authService.hasRole('super admin')) {
      const hotelId = this.cleanId(item.hotelId);
      return hotelId
        ? ['/hotel-details', hotelId, 'trip', tripRequestId]
        : ['/hotel-details', 'trip', tripRequestId];
    }

    return ['/TripDetails', tripRequestId];
  }

  private cleanId(value: string | null | undefined): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private navigateToRoute(route: string[] | null): void {
    if (!route) return;

    this.closePanel.emit();
    void this.router.navigate(route);
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
