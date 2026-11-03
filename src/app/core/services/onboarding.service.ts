import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SKIP_LOADING } from '../tokens/skip-loading.token';
import type { Result } from '../models/result.model';

/**
 * Hotel onboarding (first sign-in).
 * GET /users/profile → `configuration.onboarding: true` means show it;
 * PUT /hotels/onboarding/complete (no body) marks it done — the flag then returns `false`.
 */
@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly api = inject(ApiService);

  complete(): Observable<Result<unknown>> {
    return this.api.put<unknown>('/hotels/onboarding/complete', {}, new HttpContext().set(SKIP_LOADING, true));
  }
}
