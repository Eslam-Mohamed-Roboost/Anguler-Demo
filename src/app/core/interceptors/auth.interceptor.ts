// Attaches JWT bearer token to outgoing HTTP requests when authenticated
import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { LoginService } from '../../features/booking/components/services/login.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only attach token for requests going to our API
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = inject(LoginService).getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
