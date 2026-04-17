// Generic HttpClient wrapper — all HTTP communication goes through this service
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Result } from '../models/result.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: HttpParams, context?: HttpContext): Observable<Result<T>> {
    return this.http.get<Result<T>>(`${this.baseUrl}${path}`, { params, context });
  }

  post<T>(path: string, body: unknown, context?: HttpContext): Observable<Result<T>> {
    return this.http.post<Result<T>>(`${this.baseUrl}${path}`, body, { context });
  }

  put<T>(path: string, body: unknown, context?: HttpContext): Observable<Result<T>> {
    return this.http.put<Result<T>>(`${this.baseUrl}${path}`, body, { context });
  }

  patch<T>(path: string, body: unknown, context?: HttpContext): Observable<Result<T>> {
    return this.http.patch<Result<T>>(`${this.baseUrl}${path}`, body, { context });
  }

  delete<T>(path: string, context?: HttpContext): Observable<Result<T>> {
    return this.http.delete<Result<T>>(`${this.baseUrl}${path}`, { context });
  }
}
