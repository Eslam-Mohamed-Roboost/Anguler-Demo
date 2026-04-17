import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { Result } from '../../../core/models/result.model';

export interface HotelTripItem {
  tripRequestId: string;
  tripCode: string;
  guestName: string;
  roomNumber: number;
  driverName: string | null;
  driverAvatarUrl: string | null;
  startLocation: { address: string };
  endLocation: { address: string };
  status: string;
  durationMinutes: number;
  distanceInKm: number;
  fare: number | null;
  commission: number | null;
  currency: string;
  startedAt: string;
  endedAt: string;
}

export interface HotelProfileResponse {
  hotelId: string;
  hotelName: string;
  address: string;
  phoneNumber: string;
  email: string;
  imageUrl: string | null;
}

export interface HotelTripsResponse {
  items: HotelTripItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class HotelDetailsService extends ApiService {
  getMyProfile(): Observable<Result<HotelProfileResponse>> {
    return this.get<HotelProfileResponse>('/hotels/profile');
  }

  getHotelTrips(
    pageNumber: number,
    pageSize: number,
    status?: string,
  ): Observable<Result<HotelTripsResponse>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<Result<HotelTripsResponse>>(`${this.baseUrl}/hotels/trips`, { params });
  }
}
