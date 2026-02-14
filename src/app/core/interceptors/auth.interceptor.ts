// Attaches JWT bearer token to outgoing HTTP requests when authenticated
import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip auth header for external API calls
  if (req.url.startsWith('http')) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.token();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
