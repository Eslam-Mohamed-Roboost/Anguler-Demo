import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AdminApiService } from '../../../core/services/admin-api.service';
import type { Result } from '../../../core/models/result.model';
import { DashboardStatsResponse, HotelApiItem, HotelKpiResponse, HotelProfileResponse, HotelsListResponse, HotelTripsResponse, WithdrawalDetailsResponse, WithdrawalDetailsUpdate } from '../models/dto';

@Injectable({ providedIn: 'root' })
export class HotelDetailsService extends ApiService {
  private readonly adminApi = inject(AdminApiService);

  getMyProfile(): Observable<Result<HotelProfileResponse>> {
    return this.get<HotelProfileResponse>('/hotels/profile');
  }

  updateProfile(data: HotelApiItem): Observable<Result<HotelApiItem>> {
    return this.put<HotelApiItem>('/hotels/profile', data);
  }

  getWithdrawalDetails(hotelId: string): Observable<Result<WithdrawalDetailsResponse>> {
    return this.get<WithdrawalDetailsResponse>(`/hotels/withdrawal-details/${hotelId}`);
  }

  updateWithdrawalDetails(data: WithdrawalDetailsUpdate): Observable<Result<WithdrawalDetailsResponse>> {
    return this.put<WithdrawalDetailsResponse>('/hotels/withdrawal-details', data);
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
    sortBy: number = 0,
    status?: string,
    search?: string,
  ): Observable<Result<HotelsListResponse>> {
    let params = new HttpParams()
      .set('SortBy', sortBy)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (status) {
      params = params.set('status', status);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.adminApi.get<HotelsListResponse>('/admin/hotels/financials', params);
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
      .set('pageSize', pageSize)
      .set('hotelUserId', hotelId);
    return this.get<HotelTripsResponse>('/hotels/trips', params);
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


  getHotelKpi(hotelId: string): Observable<Result<HotelKpiResponse>> {
     return this.get<HotelKpiResponse>(`/hotels/${hotelId}/kpi`); 
   }

  toggleBlockHotel(hotelId: string): Observable<Result<boolean>> {
    return this.adminApi.put<boolean>(`/admin/hotels/${hotelId}/toggle-block`, {});
  }

    updateHotelCommission(newCommission: number): Observable<Result<void>> {
      return this.adminApi.put<void>('/admin/hotels/global-commission', { newCommission });
    }

  getUnsettledPayouts(hotelId: string): Observable<Result<number>> {
    return this.adminApi.get<number>(`/admin/hotels/payouts/${hotelId}/unsettled`);
  }

  settleAllPayouts(hotelId: string): Observable<Result<void>> {
    return this.adminApi.put<void>(`/admin/hotels/payouts/${hotelId}/settle-all`, {});
  }

  getServicePreferences(
    pageNumber: number = 1,
    pageSize: number = 20,
  ): Observable<Result<{ services: { items: Array<{ serviceId: string; serviceName: string; serviceCode: string }>; pageNumber: number; pageSize: number; totalCount: number; totalPages: number } }>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.get('/hotels/service-preferences', params);
  }
}
