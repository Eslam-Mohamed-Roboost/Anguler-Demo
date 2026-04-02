// Attaches Accept-Language header to outgoing API requests based on the active language
import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { LanguageService } from '../services/language.service';
import { environment } from '../../../environments/environment';

const API_ORIGINS = [environment.apiUrl, environment.adminApiUrl];

export const langInterceptor: HttpInterceptorFn = (req, next) => {
  if (!API_ORIGINS.some((base) => req.url.startsWith(base))) {
    return next(req);
  }

  const lang = inject(LanguageService).lang();

  return next(
    req.clone({ setHeaders: { 'Accept-Language': lang } }),
  );
};
