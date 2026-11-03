import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { SKIP_LOADING } from '../tokens/skip-loading.token';
import { SKIP_ERROR_NOTIFICATION } from '../tokens/skip-error-notification.token';
import type { Result } from '../models/result.model';
import type { AuthProfile } from './auth.service';

/**
 * Hotel onboarding (first sign-in).
 * GET /users/profile → `configuration.onboarding: true` means show it;
 * PUT /hotels/onboarding/complete (no body) marks it done — the flag then returns `false`.
 */
@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly api = inject(ApiService);

  /** Reads the flag straight from the backend (never from the cached profile). */
  isPending(): Observable<boolean> {
    const context = new HttpContext().set(SKIP_LOADING, true).set(SKIP_ERROR_NOTIFICATION, true);
    return this.api
      .get<AuthProfile>('/users/profile', undefined, context)
      .pipe(map((result) => result.isSuccess && result.data?.configuration?.onboarding === true));
  }

  complete(): Observable<Result<unknown>> {
    return this.api.put<unknown>('/hotels/onboarding/complete', {}, new HttpContext().set(SKIP_LOADING, true));
  }
}
