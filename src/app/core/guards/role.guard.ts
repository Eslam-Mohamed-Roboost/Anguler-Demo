// Functional guard factory — restricts access based on user roles
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Creates a CanActivateFn that checks whether the current user has
 * at least one of the specified roles.
 *
 * Usage in routes:
 *   canActivate: [roleGuard(['admin', 'editor'])]
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // Redirect to home if role requirement not met
    return router.createUrlTree(['/']);
  };
}
