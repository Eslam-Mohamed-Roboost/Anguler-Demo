import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { SKIP_ERROR_NOTIFICATION } from '../../../core/tokens/skip-error-notification.token';
import type { Result } from '../../../core/models/result.model';

/**
 * Hotel Stripe Connect endpoints — mirror of the driver ones
 * (`/drivers/stripe/onboarding-link`, `/drivers/stripe/status`).
 * Change here if the backend picks different routes.
 */
export const HOTEL_STRIPE_ENDPOINTS = {
  onboardingLink: '/hotels/stripe/onboarding-link',
  status: '/hotels/stripe/status',
} as const;

export interface HotelStripeStatus {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  /** Optional display fields for the connected payout account. */
  accountHolderName?: string | null;
  bankName?: string | null;
  last4?: string | null;
}

export interface StripeOnboardingRequest {
  returnUrl: string;
  refreshUrl: string;
}

/** `null` = hotel Stripe Connect is not available on the backend yet. */
export type HotelStripeStatusResult = HotelStripeStatus | null;

@Injectable({ providedIn: 'root' })
export class StripeConnectService {
  private readonly api = inject(ApiService);

  getStatus(): Observable<HotelStripeStatusResult> {
    const context = new HttpContext().set(SKIP_ERROR_NOTIFICATION, true);

    return this.api.get<HotelStripeStatus>(HOTEL_STRIPE_ENDPOINTS.status, undefined, context).pipe(
      map((result) => (result.isSuccess && result.data ? result.data : null)),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && (error.status === 404 || error.status === 405)) {
          return of(null);
        }
        throw error;
      }),
    );
  }

  /** Returns the Stripe-hosted onboarding / account-update URL. */
  createOnboardingLink(request: StripeOnboardingRequest): Observable<Result<string>> {
    return this.api.post<string>(HOTEL_STRIPE_ENDPOINTS.onboardingLink, request);
  }
}
