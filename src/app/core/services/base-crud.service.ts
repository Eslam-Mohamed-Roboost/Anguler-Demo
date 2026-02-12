// Generic CRUD service — all feature services MUST extend this
import { inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export abstract class BaseCrudService<T> {
  protected readonly api = inject(ApiService);

  abstract readonly endpoint: string;

  getAll(params?: HttpParams): Observable<T[]> {
    return this.api.get<T[]>(this.endpoint, params);
  }

  getById(id: number | string): Observable<T> {
    return this.api.get<T>(`${this.endpoint}/${id}`);
  }

  create(item: Partial<T>): Observable<T> {
    return this.api.post<T>(this.endpoint, item);
  }

  update(id: number | string, item: Partial<T>): Observable<T> {
    return this.api.put<T>(`${this.endpoint}/${id}`, item);
  }

  patch(id: number | string, item: Partial<T>): Observable<T> {
    return this.api.patch<T>(`${this.endpoint}/${id}`, item);
  }

  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
