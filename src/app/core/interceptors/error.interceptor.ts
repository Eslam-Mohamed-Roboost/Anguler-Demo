// Centralized API error handling — maps HTTP errors to user-friendly messages
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationStore } from '../stores/notification.store';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { SKIP_ERROR_NOTIFICATION } from '../tokens/skip-error-notification.token';

// A 401 from these means "wrong credentials", not "expired session"
const CREDENTIAL_ENDPOINTS = ['/users/login', '/users/reset-password', '/users/change-password'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationStore);
  // AuthService issues requests from its own constructor, so it is resolved
  // lazily on failure instead of eagerly here (circular dependency otherwise).
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const endpoint = req.urlWithParams;
      console.error('API Error:', { endpoint, error });

      // Ends the session at most once, even when several requests fail together
      const sessionEnded = error.status === 401 && endExpiredSession(injector, req.url);

      if (sessionEnded) {
        notifications.showError(withDevelopmentEndpoint(mapErrorMessage(error.status), endpoint));
      } else if (!req.context.get(SKIP_ERROR_NOTIFICATION)) {
        notifications.showError(withDevelopmentEndpoint(getErrorMessage(error), endpoint));
      }

      return throwError(() => error);
    }),
  );
};

/**
 * Clears the stored session and sends the user home with the sign-in modal open.
 * Returns `false` — leaving the error to the generic handler — when the 401 is
 * not a session expiry: foreign hosts, credential checks, or no session at all.
 */
function endExpiredSession(injector: Injector, url: string): boolean {
  if (!isOwnApi(url)) return false;
  if (CREDENTIAL_ENDPOINTS.some((endpoint) => url.includes(endpoint))) return false;

  const authService = injector.get(AuthService);
  if (!authService.isAuthenticated()) return false;

  authService.logout();
  injector.get(Router).navigate(['/home'], { queryParams: { signin: '1' } });

  return true;
}

function isOwnApi(url: string): boolean {
  return url.startsWith(environment.apiUrl) || url.startsWith(environment.adminApiUrl);
}

function withDevelopmentEndpoint(message: string, endpoint: string): string {
  if (environment.production) {
    return message;
  }

  return `${message} Endpoint: ${endpoint}`;
}

function getErrorMessage(error: HttpErrorResponse): string {
  const backendMessage = extractBackendMessage(error);

  return backendMessage || mapErrorMessage(error.status);
}

function extractBackendMessage(error: HttpErrorResponse): string {
  if (typeof error.error === 'string' && error.error.trim()) {
    return error.error.trim();
  }

  if (error.error && typeof error.error === 'object') {
    const body = error.error as Record<string, unknown>;
    const message = body['message'] ?? body['title'] ?? body['detail'];
    const resultError = body['error'];

    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }

    if (resultError && typeof resultError === 'object') {
      const description = (resultError as Record<string, unknown>)['description'];
      if (typeof description === 'string' && description.trim()) {
        return description.trim();
      }
    }
  }

  return isCustomStatusText(error.statusText) ? error.statusText.trim() : '';
}

function isCustomStatusText(statusText: string): boolean {
  const normalized = statusText.trim().toLowerCase();

  if (!normalized || normalized === 'ok') return false;

  return ![
    'unknown error',
    'bad request',
    'unauthorized',
    'forbidden',
    'not found',
    'conflict',
    'unprocessable entity',
    'too many requests',
    'internal server error',
  ].includes(normalized);
}

function mapErrorMessage(status: number): string {
  switch (status) {
    case 0:
      return $localize`:@@error.network:Network error. Check your connection.`;
    case 400:
      return $localize`:@@error.badRequest:Bad request. Please check your input.`;
    case 401:
      return $localize`:@@error.unauthorized:Session expired. Please log in again.`;
    case 403:
      return $localize`:@@error.forbidden:You do not have permission for this action.`;
    case 404:
      return $localize`:@@error.notFound:Resource not found.`;
    case 409:
      return $localize`:@@error.conflict:Conflict. The resource was modified by another user.`;
    case 422:
      return $localize`:@@error.validation:Validation failed. Please check your input.`;
    case 429:
      return $localize`:@@error.tooMany:Too many requests. Please try again later.`;
    default:
      return status >= 500
        ? $localize`:@@error.server:Server error. Please try again later.`
        : $localize`:@@error.unknown:An unexpected error occurred.`;
  }
}
