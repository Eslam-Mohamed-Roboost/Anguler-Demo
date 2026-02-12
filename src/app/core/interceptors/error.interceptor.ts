// Centralized API error handling — maps HTTP errors to user-friendly messages
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationStore } from '../stores/notification.store';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = mapErrorMessage(error.status);
      notifications.showError(message);
      return throwError(() => error);
    }),
  );
};

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
