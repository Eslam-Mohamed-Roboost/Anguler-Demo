import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

export type PayoutAccountState = 'setup' | 'pending' | 'ready';

export interface PayoutAccountSummary {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
}

const ILLUSTRATIONS: Record<PayoutAccountState, { src: string; width: number; height: number }> = {
  setup: { src: 'assets/payout/payout-setup.png', width: 480, height: 278 },
  pending: { src: 'assets/payout/payout-pending.png', width: 480, height: 267 },
  ready: { src: 'assets/payout/payout-ready.png', width: 480, height: 235 },
};

@Component({
  selector: 'app-payout-account-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, NgTemplateOutlet, IconComponent, TranslatePipe],
  templateUrl: './payout-account-card.component.html',
  styleUrl: './payout-account-card.component.css',
})
export class PayoutAccountCardComponent {
  readonly state = input.required<PayoutAccountState>();
  readonly account = input<PayoutAccountSummary | null>(null);
  readonly busy = input(false);
  readonly canRemove = input(true);
  /** Translation key for the setup button. */
  readonly connectLabel = input('payout.connect');
  /** `soft` = light green button (used inside the registration modal). */
  readonly connectVariant = input<'solid' | 'soft'>('solid');

  readonly connect = output<void>();
  readonly edit = output<void>();
  readonly remove = output<void>();

  protected readonly illustration = computed(() => ILLUSTRATIONS[this.state()]);
}
