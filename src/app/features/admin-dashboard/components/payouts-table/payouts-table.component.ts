import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

export type PayoutTab = 'Driver Payouts' | 'Hotels Payouts';

export interface PayoutRow {
  payoutId: string;
  driverName: string;
  driverCode: string;
  totalProfit: number;
  appProfit: number;
  pendingPayouts: number;
  pendingStatus: string;
  payoutsStatus: string;
  payoutsStatusAmount: string;
  cycleEndDate: string;
}

@Component({
  selector: 'app-payouts-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payouts-table.component.html',
  styleUrl: './payouts-table.component.css',
})
export class PayoutsTableComponent {
  readonly payouts = input<PayoutRow[]>([]);

  protected readonly activeTab = signal<PayoutTab>('Driver Payouts');
  protected readonly tabs: PayoutTab[] = ['Driver Payouts', 'Hotels Payouts'];

  selectTab(tab: PayoutTab): void {
    this.activeTab.set(tab);
  }
}
