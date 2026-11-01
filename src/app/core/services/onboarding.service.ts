import { Injectable } from '@angular/core';

const DISMISSED_KEY = 'lines.onboardingDismissed';

/**
 * Tracks whether the "Set Up Your Payout Account" prompt was already answered
 * in this browser session, so it shows once per session instead of on every page.
 */
@Injectable({ providedIn: 'root' })
export class OnboardingService {
  /** Called on sign-in so a fresh login always gets the prompt again. */
  markLogin(): void {
    try {
      sessionStorage.removeItem(DISMISSED_KEY);
    } catch {
      // Storage unavailable — prompt simply shows again.
    }
  }

  isDismissed(): boolean {
    try {
      return sessionStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  }

  dismiss(): void {
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Storage unavailable — prompt may show again on reload.
    }
  }
}
