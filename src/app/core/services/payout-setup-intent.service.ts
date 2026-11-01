import { Injectable } from '@angular/core';

const STORAGE_KEY = 'lines.payoutSetupPending';

/**
 * Remembers that a hotel chose "Connect Bank Account" while registering,
 * so the payout setup (Stripe) can start right after their first sign-in.
 */
@Injectable({ providedIn: 'root' })
export class PayoutSetupIntentService {
  remember(email: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, email.trim().toLowerCase());
    } catch {
      // Storage unavailable — the hotel can still connect from Profile → Withdrawal Details.
    }
  }

  /** Returns true (and clears the intent) when it belongs to this email. */
  consume(email: string): boolean {
    try {
      const pending = localStorage.getItem(STORAGE_KEY);
      if (!pending || pending !== email.trim().toLowerCase()) return false;
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }
}
