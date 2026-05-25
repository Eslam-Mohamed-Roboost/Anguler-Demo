// Generic HttpClient wrapper — all HTTP communication goes through this service
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Result } from '../models/result.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: HttpParams, context?: HttpContext): Observable<Result<T>> {
    const url = `${this.baseUrl}${path}`;

    return this.http
      .get<Result<T>>(url, { params, context })
      .pipe(map((result) => this.withDevelopmentEndpoint(result, this.buildEndpoint(url, params))));
  }

  post<T>(path: string, body: unknown, context?: HttpContext): Observable<Result<T>> {
    const url = `${this.baseUrl}${path}`;

    return this.http
      .post<Result<T>>(url, body, { context })
      .pipe(map((result) => this.withDevelopmentEndpoint(result, url)));
  }

  put<T>(path: string, body: unknown, context?: HttpContext): Observable<Result<T>> {
    const url = `${this.baseUrl}${path}`;

    return this.http
      .put<Result<T>>(url, body, { context })
      .pipe(map((result) => this.withDevelopmentEndpoint(result, url)));
  }

  patch<T>(path: string, body: unknown, context?: HttpContext): Observable<Result<T>> {
    const url = `${this.baseUrl}${path}`;

    return this.http
      .patch<Result<T>>(url, body, { context })
      .pipe(map((result) => this.withDevelopmentEndpoint(result, url)));
  }

  delete<T>(path: string, context?: HttpContext): Observable<Result<T>> {
    const url = `${this.baseUrl}${path}`;

    return this.http
      .delete<Result<T>>(url, { context })
      .pipe(map((result) => this.withDevelopmentEndpoint(result, url)));
  }

  private withDevelopmentEndpoint<T>(result: Result<T>, endpoint: string): Result<T> {
    if (environment.production || result.isSuccess) {
      return result;
    }

    const endpointMessage = `Endpoint: ${endpoint}`;
    const currentDescription = result.error?.description?.trim() || 'Request failed.';
    const description = currentDescription.includes(endpointMessage)
      ? currentDescription
      : `${currentDescription} ${endpointMessage}`;

    return {
      ...result,
      error: {
        code: result.error?.code ?? 'Api.Error',
        description,
        type: result.error?.type ?? 0,
      },
    };
  }

  private buildEndpoint(url: string, params?: HttpParams): string {
    const query = params?.toString();

    return query ? `${url}?${query}` : url;
  }
}
