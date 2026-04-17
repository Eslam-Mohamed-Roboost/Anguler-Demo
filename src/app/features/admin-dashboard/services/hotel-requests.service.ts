import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ApiService } from '../../../core/services/api.service';
import type { Result } from '../../../core/models/result.model';
import type { HotelRequestsHistoryResponse } from '../../RiderHistory/models/trip-model';

export interface DriverItem {
  driverId: string;
  driverCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: number;
  totalTrips: number;
  totalEarnings: number;
  rating: number;
  lastActivity: string;
}

export interface DriversListResponse {
  items: DriverItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class HotelRequestsService extends AdminApiService {
  private readonly linesApi = inject(ApiService);

  getPendingRequests(
    pageNumber: number,
    pageSize: number,
  ): Observable<Result<HotelRequestsHistoryResponse>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http.get<Result<HotelRequestsHistoryResponse>>(
      `${this.baseUrl}/admin/hotel-requests`,
      { params },
    );
  }

  getDrivers(pageNumber = 1, pageSize = 100): Observable<Result<DriversListResponse>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.get<DriversListResponse>('/admin/drivers', params);
  }

  assignDriver(tripRequestId: string, driverId: string): Observable<Result<void>> {
    return this.linesApi.post<void>(
      `/admin/hotel-requests/${tripRequestId}/assign-driver`,
      { driverId },
    );
  }
}
