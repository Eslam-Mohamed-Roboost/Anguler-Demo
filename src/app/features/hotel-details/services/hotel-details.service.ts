import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AdminApiService } from '../../../core/services/admin-api.service';
import type { Result } from '../../../core/models/result.model';

export interface HotelTripItem {
  tripRequestId: string;
  hotelName:string;
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
  hotelId: string;
  items: HotelTripItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface HotelApiItem {
  id: string;
  hotelName: string;
  cityId: string;
  address: string;
  locationUrl: string;
  phoneNumber: string;
  email: string;
  logoUrl: string;
  commissionRate: number;
  isActive: boolean;
  isVerified: boolean;
}

export interface HotelsListResponse {
  items: HotelApiItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DashboardStatsResponse {
  totalHotels: number;
  totalRevenue: number;
  hotelsCommission: number;
  linesNetProfit: number;
  activeTrips: number;
  scheduledTrips: number;
  completedTrips: number;
  canceledTrips: number;
}

@Injectable({ providedIn: 'root' })
export class HotelDetailsService extends ApiService {
  private readonly adminApi = inject(AdminApiService);

  getMyProfile(): Observable<Result<HotelProfileResponse>> {
    return this.get<HotelProfileResponse>('/hotels/profile');
  }

  getHotelTrips(
    pageNumber: number,
    pageSize: number,
    status?: string,
    search?: string,
  ): Observable<Result<HotelTripsResponse>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (status) {
      params = params.set('status', status);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.get<HotelTripsResponse>('/hotels/trips', params);
  }

  getAllHotels(
    pageNumber: number,
    pageSize: number,
    hotelName?: string,
  ): Observable<Result<HotelsListResponse>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (hotelName) {
      params = params.set('HotelName', hotelName);
    }

    return this.get<HotelsListResponse>('/hotels', params);
  }

  getHotelById(hotelId: string): Observable<Result<HotelApiItem>> {
    return this.get<HotelApiItem>(`/hotels/${hotelId}`);
  }

  getHotelTripsById(
    hotelId: string,
    pageNumber: number,
    pageSize: number,
  ): Observable<Result<HotelTripsResponse>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.adminApi.get<HotelTripsResponse>(`/admin/hotels/${hotelId}/trips`, params);
  }

  getDashboardStats(
    fromDate: string,
    toDate: string,
  ): Observable<Result<DashboardStatsResponse>> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.adminApi.get<DashboardStatsResponse>('/admin/hotels/dashboard', params);
  }
}
