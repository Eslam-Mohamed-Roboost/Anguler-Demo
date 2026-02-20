import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export interface BillingItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  description?: string;
}

@Component({
  selector: 'app-billing-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './billing-panel.component.html',
})
export class BillingPanelComponent {
  /** Whether the panel is open */
  readonly isOpen = input<boolean>(false);

  /** Billing items to display */
  readonly billingItems = input<BillingItem[]>([]);

  /** Close panel event */
  readonly closePanel = output<void>();

  /** Pay bill event */
  readonly payBill = output<BillingItem>();

  /** View bill details event */
  readonly viewBill = output<BillingItem>();

  /** Expanded items state */
  protected readonly expandedItems = signal<Set<string>>(new Set());

  /** Default mock data if no items provided */
  protected readonly defaultBillingData = signal<BillingItem[]>([
    {
      id: '1',
      title: 'Room Booking - Deluxe Suite',
      amount: 250.00,
      date: '2024-01-20',
      status: 'pending',
      description: 'Deluxe suite for 2 nights at Salam Hotel with complimentary breakfast and spa access'
    },
    {
      id: '2', 
      title: 'Airport Transfer',
      amount: 45.00,
      date: '2024-01-18',
      status: 'paid',
      description: 'Private airport pickup and drop-off service with luxury vehicle'
    },
    {
      id: '3',
      title: 'Spa Services',
      amount: 120.00,
      date: '2024-01-15',
      status: 'overdue',
      description: 'Full body massage and wellness treatments including aromatherapy session'
    },
    {
      id: '4',
      title: 'Restaurant Reservation',
      amount: 85.50,
      date: '2024-01-12',
      status: 'paid',
      description: 'Dinner for two at our signature restaurant with wine pairing'
    },
    {
      id: '5',
      title: 'Laundry Service',
      amount: 35.00,
      date: '2024-01-10',
      status: 'pending',
      description: 'Premium laundry and dry cleaning services for your entire stay'
    }
  ]);

  /** Get billing items (use provided data or default mock data) */
  protected getBillingItems(): BillingItem[] {
    const items = this.billingItems();
    return items.length > 0 ? items : this.defaultBillingData();
  }

  /** Close panel */
  protected onClose(): void {
    this.closePanel.emit();
  }

  /** Handle pay bill */
  protected onPayBill(item: BillingItem): void {
    this.payBill.emit(item);
  }

  /** Handle view bill */
  protected onViewBill(item: BillingItem): void {
    this.viewBill.emit(item);
  }

  /** Toggle item expansion */
  protected toggleExpansion(item: BillingItem): void {
    const current = new Set(this.expandedItems());
    if (current.has(item.id)) {
      current.delete(item.id);
    } else {
      current.add(item.id);
    }
    this.expandedItems.set(current);
  }

  /** Check if item is expanded */
  protected isExpanded(item: BillingItem): boolean {
    return this.expandedItems().has(item.id);
  }

  /** Get status text */
  protected getStatusText(status: string): string {
    switch (status) {
      case 'paid': return 'Paid';
      case 'pending': return 'Pending';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  }

  /** Format currency */
  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  /** Calculate total amount */
  protected getTotalAmount(): number {
    return this.getBillingItems().reduce((total, item) => total + item.amount, 0);
  }

  /** Get unpaid count */
  protected getUnpaidCount(): number {
    return this.getBillingItems().filter(item => item.status !== 'paid').length;
  }

  /** Get mock billing data for demo */
  protected createMockBillingData(): BillingItem[] {
    return [
      {
        id: '1',
        title: 'Room Booking - Deluxe Suite',
        amount: 250.00,
        date: '2024-01-20',
        status: 'pending',
        description: 'Deluxe suite for 2 nights at Salam Hotel with complimentary breakfast and spa access'
      },
      {
        id: '2', 
        title: 'Airport Transfer',
        amount: 45.00,
        date: '2024-01-18',
        status: 'paid',
        description: 'Private airport pickup and drop-off service with luxury vehicle'
      },
      {
        id: '3',
        title: 'Spa Services',
        amount: 120.00,
        date: '2024-01-15',
        status: 'overdue',
        description: 'Full body massage and wellness treatments including aromatherapy session'
      },
      {
        id: '4',
        title: 'Restaurant Reservation',
        amount: 85.50,
        date: '2024-01-12',
        status: 'paid',
        description: 'Dinner for two at our signature restaurant with wine pairing'
      },
      {
        id: '5',
        title: 'Laundry Service',
        amount: 35.00,
        date: '2024-01-10',
        status: 'pending',
        description: 'Premium laundry and dry cleaning services for your entire stay'
      }
    ];
  }
}
