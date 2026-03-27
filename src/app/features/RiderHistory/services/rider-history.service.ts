import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Result } from '../../../core/models/result.model';
import {
  HotelRequestsHistoryResponse,
  HotelRequestsQuery,
} from '../models/trip-model';

@Injectable({ providedIn: 'root' })
export class RiderHistoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.adminApiUrl;

  getHotelRequestsHistory(
    query: HotelRequestsQuery
  ): Observable<Result<HotelRequestsHistoryResponse>> {
    const params = new HttpParams()
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);

    return this.http.get<Result<HotelRequestsHistoryResponse>>(
      `${this.baseUrl}/admin/hotel-requests/history`,
      { params }
    );
  }
}
