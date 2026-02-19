import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
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
  styleUrl: './billing-panel.component.css',
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

  /** Get status color class */
  protected getStatusClass(status: BillingItem['status']): string {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      case 'overdue':
        return 'status-overdue';
      default:
        return '';
    }
  }

  /** Get status text */
  protected getStatusText(status: BillingItem['status']): string {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'overdue':
        return 'Overdue';
      default:
        return '';
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
    return this.billingItems().reduce((total, item) => total + item.amount, 0);
  }

  /** Get unpaid count */
  protected getUnpaidCount(): number {
    return this.billingItems().filter(item => item.status !== 'paid').length;
  }
}
