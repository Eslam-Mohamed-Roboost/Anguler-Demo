import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminApiService } from '../../../core/services/admin-api.service';
import type { Result } from '../../../core/models/result.model';
import type { HotelRequestsHistoryResponse, HotelRequestsQuery } from '../models/trip-model';

@Injectable({ providedIn: 'root' })
export class RiderHistoryService extends AdminApiService {
  getHotelRequestsHistory(
    query: HotelRequestsQuery,
  ): Observable<Result<HotelRequestsHistoryResponse>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);

    if (query.search) {
      params = params.set('search', query.search);
    }

    return this.get<HotelRequestsHistoryResponse>('/admin/hotel-requests/history', params);
  }
}
