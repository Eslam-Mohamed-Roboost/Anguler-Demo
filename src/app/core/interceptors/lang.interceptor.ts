// Attaches Accept-Language header to outgoing API requests based on the active language
import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { LanguageService } from '../services/language.service';
import { environment } from '../../../environments/environment';

export const langInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const lang = inject(LanguageService).lang();

  return next(
    req.clone({ setHeaders: { 'Accept-Language': lang } }),
  );
};
