// Top navigation bar — breadcrumbs, theme toggle, auth info
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationStore } from '../../../core/stores/notification.store';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { BillingPanelComponent, BillingItem } from '../billing-panel/billing-panel.component';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, BreadcrumbComponent, TooltipDirective, BillingPanelComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationStore);
  readonly menuToggle = output<void>();
  readonly messageClick = output<void>();
  readonly notificationClick = output<void>();

  /** Optional message count */
  readonly messageCount = input<number>(0);

  /** Optional notification count */
  readonly notificationCount = input<number>(0);

  /** Show message and notification icons */
  readonly showNavIcons = input<boolean>(true);

  /** Mobile menu open state */
  protected readonly mobileMenuOpen = signal(false);

  /** Billing panel open state */
  protected readonly billingPanelOpen = signal(false);

  /** Sample billing data */
  protected readonly billingItems = signal<BillingItem[]>([
    {
      id: '1',
      title: 'Monthly Subscription',
      amount: 29.99,
      date: '2024-01-15',
      status: 'pending',
      description: 'Premium plan subscription for January 2024'
    },
    {
      id: '2', 
      title: 'Hotel Booking Fee',
      amount: 150.00,
      date: '2024-01-10',
      status: 'paid',
      description: 'Booking fee for Salam Hotel reservation'
    },
    {
      id: '3',
      title: 'Service Charge',
      amount: 45.50,
      date: '2024-01-05',
      status: 'overdue',
      description: 'Additional service charges'
    }
  ]);

  /** Mock login for demo purposes — calls the mock auth endpoint */
  protected mockLogin(): void {
    this.authService.login('admin@demo.com', 'password').subscribe({
      next: () => {
        this.notifications.showSuccess(
          $localize`:@@nav.loginSuccess:Logged in successfully`,
        );
      },
    });
  }

  /** Handle message click */
  protected onMessageClick(): void {
    this.messageClick.emit();
  }

  /** Handle notification click */
  protected onNotificationClick(): void {
    // Open billing panel when notification icon is clicked
    this.billingPanelOpen.set(true);
    this.notificationClick.emit();
  }

  /** Toggle mobile menu */
  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  /** Close billing panel */
  protected onCloseBillingPanel(): void {
    this.billingPanelOpen.set(false);
  }

  /** Handle pay bill */
  protected onPayBill(item: BillingItem): void {
    console.log('Paying bill:', item);
    // Update item status to paid
    const updatedItems = this.billingItems().map(billingItem => 
      billingItem.id === item.id 
        ? { ...billingItem, status: 'paid' as const }
        : billingItem
    );
    this.billingItems.set(updatedItems);
    this.notifications.showSuccess(`Payment processed for ${item.title}`);
  }

  /** Handle view bill */
  protected onViewBill(item: BillingItem): void {
    console.log('Viewing bill:', item);
    this.notifications.showInfo(`Viewing details for ${item.title}`);
  }
}
