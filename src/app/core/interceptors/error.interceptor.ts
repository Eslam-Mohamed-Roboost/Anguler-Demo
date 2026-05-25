// Centralized API error handling — maps HTTP errors to user-friendly messages
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationStore } from '../stores/notification.store';
import { environment } from '../../../environments/environment';
import { SKIP_ERROR_NOTIFICATION } from '../tokens/skip-error-notification.token';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const endpoint = req.urlWithParams;
      console.error('API Error:', { endpoint, error });
      if (!req.context.get(SKIP_ERROR_NOTIFICATION)) {
        const message = withDevelopmentEndpoint(getErrorMessage(error), endpoint);
        notifications.showError(message);
      }
      return throwError(() => error);
    }),
  );
};

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
