import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { BillingPanelComponent, BillingItem } from '../billing-panel/billing-panel.component';
import { MessagePanelComponent, Message } from '../message-panel/message-panel.component';

@Component({
  selector: 'app-navbar-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RouterLink, BillingPanelComponent, MessagePanelComponent],
  templateUrl: './navbar-booking.component.html',
  host: { class: 'relative z-20 block' },
})
export class NavbarBookingComponent {
  private readonly doc = inject(DOCUMENT);

  /** Logo image source */
  readonly logoSrc = input('assets/booking/logo-lines.png');

  /** Logo alt text */
  readonly logoAlt = input('Lines');

  /** Sign in button text */
  readonly signInText = input('Sign In');

  /** Join us button text */
  readonly joinUsText = input('Join Us Now');

  /** Whether to show the join us button with lightning icon */
  readonly showJoinUsIcon = input(true);

  /** Current language */
  readonly lang = signal<'en' | 'ar'>('en');

  /** Emitted when language changes */
  readonly langChange = output<'en' | 'ar'>();

  /** Emitted when Sign In is clicked */
  readonly signInClick = output<void>();

  /** Emitted when Join Us is clicked */
  readonly joinUsClick = output<void>();

  /** Whether the user is authenticated */
  readonly isAuthenticated = input(false);

  /** Hotel name to display in profile pill */
  readonly hotelName = input('Salam Hotel');

  /** Notification counts */
  readonly callCount = signal(3);
  readonly bellCount = signal(3);

  /** Panel states */
  protected readonly messagePanelOpen = signal(false);
  protected readonly billingPanelOpen = signal(false);

  /** Sample billing data */
  protected readonly billingItems = signal<BillingItem[]>([
    {
      id: '1',
      title: 'Room Booking - Deluxe Suite',
      amount: 250.00,
      date: '2024-01-20',
      status: 'pending',
      description: 'Deluxe suite for 2 nights at Salam Hotel'
    },
    {
      id: '2', 
      title: 'Airport Transfer',
      amount: 45.00,
      date: '2024-01-18',
      status: 'paid',
      description: 'Airport pickup and drop-off service'
    },
    {
      id: '3',
      title: 'Spa Services',
      amount: 120.00,
      date: '2024-01-15',
      status: 'overdue',
      description: 'Massage and wellness treatments'
    }
  ]);

  /** Sample message data */
  protected readonly messages = signal([
    {
      id: '1',
      tripID: 'TRIP-001',
      sender: 'Front Desk',
      content: 'Your room is ready for check-in',
      time: '2 hours ago',
      read: false
    },
    {
      id: '2',
      tripID: 'TRIP-002',
      sender: 'Concierge',
      content: 'Your airport transfer has been confirmed',
      time: '5 hours ago',
      read: false
    },
    {
      id: '3',
      tripID: 'TRIP-003',
      sender: 'Housekeeping',
      content: 'Room cleaning completed',
      time: '1 day ago',
      read: true
    }
  ]);

  /** Emitted when Trips History is clicked */
  readonly tripsHistoryClick = output<void>();

  /** Emitted when profile is clicked */
  readonly profileClick = output<void>();

  /** Derived: flag image */
  protected readonly flagSrc = computed(() =>
    this.lang() === 'en' ? 'assets/booking/flag-en.png' : 'assets/booking/flag-ar.svg',
  );

  /** Derived: language display name */
  protected readonly langLabel = computed(() =>
    this.lang() === 'en' ? 'English' : 'العربية',
  );

  toggleLang(): void {
    const next = this.lang() === 'en' ? 'ar' : 'en';
    this.lang.set(next);
    const html = this.doc.documentElement;
    html.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', next);
    this.langChange.emit(next);
  }

  /** Handle message panel toggle */
  protected onMessageClick(): void {
    this.messagePanelOpen.set(!this.messagePanelOpen());
    this.billingPanelOpen.set(false); // Close billing panel when opening message panel
  }

  /** Handle billing panel toggle */
  protected onBillingClick(): void {
    this.billingPanelOpen.set(!this.billingPanelOpen());
    this.messagePanelOpen.set(false); // Close message panel when opening billing panel
  }

  /** Close all panels */
  protected closeAllPanels(): void {
    this.messagePanelOpen.set(false);
    this.billingPanelOpen.set(false);
  }

  /** Handle message click */
  protected onMessageItemClick(message: any): void {
    console.log('Message clicked:', message);
    // Mark as read
    const updatedMessages = this.messages().map(msg => 
      msg.id === message.id ? { ...msg, read: true } : msg
    );
    this.messages.set(updatedMessages);
    this.callCount.set(Math.max(0, this.callCount() - 1));
  }

  /** Handle billing panel close */
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
    this.bellCount.set(Math.max(0, this.bellCount() - 1));
  }

  /** Handle view bill */
  protected onViewBill(item: BillingItem): void {
    console.log('Viewing bill:', item);
  }
}
