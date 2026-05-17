import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminApiService } from '../../../core/services/admin-api.service';
import type { Result } from '../../../core/models/result.model';
import type { HotelRequestsHistoryResponse, HotelRequestsQuery, TripRequestStatusesResponse } from '../models/trip-model';
import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class RiderHistoryService extends AdminApiService {
  private readonly linesApi = inject(ApiService);

  getHotelRequestsHistory(
    query: HotelRequestsQuery,
  ): Observable<Result<HotelRequestsHistoryResponse>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);

    if (query.search) {
      params = params.set('search', query.search);
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.get<HotelRequestsHistoryResponse>('/admin/hotel-requests/history', params);
  }

  getTripRequestStatuses(): Observable<Result<TripRequestStatusesResponse>> {
    return this.linesApi.get<TripRequestStatusesResponse>('/trip-request/all-status');
  }
}
