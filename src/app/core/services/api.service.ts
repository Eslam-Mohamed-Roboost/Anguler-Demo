// Generic HttpClient wrapper — all HTTP communication goes through this service
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: HttpParams, context?: HttpContext): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { params, context });
  }

  post<T>(path: string, body: unknown, context?: HttpContext): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, { context });
  }

  put<T>(path: string, body: unknown, context?: HttpContext): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body, { context });
  }

  patch<T>(path: string, body: unknown, context?: HttpContext): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, { context });
  }

  delete<T>(path: string, context?: HttpContext): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, { context });
  }
}
