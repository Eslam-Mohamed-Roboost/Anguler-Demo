import { Injectable, inject } from '@angular/core';
import { HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { AdminApiService } from '../../../core/services/admin-api.service';
import type { Result } from '../../../core/models/result.model';
import { DashboardStatsResponse, HotelApiItem, HotelKpiResponse, HotelProfileResponse, HotelsListResponse, HotelTripsResponse, TripRequestStatusesResponse, UserProfileResponse, WithdrawalDetailsResponse, WithdrawalDetailsUpdate } from '../models/dto';
import { DashboardStatsResponse, HotelApiItem, HotelFinancialSortBy, HotelKpiResponse, HotelProfileResponse, HotelsListResponse, HotelTripSortBy, HotelTripsResponse, SortDirection, TripRequestStatusesResponse, UserProfileResponse, WithdrawalDetailsResponse, WithdrawalDetailsUpdate } from '../models/dto';
import { SKIP_LOADING } from '../../../core/tokens/skip-loading.token';

@Injectable({ providedIn: 'root' })
export class HotelDetailsService extends ApiService {
  private readonly adminApi = inject(AdminApiService);

  getMyProfile(): Observable<Result<HotelProfileResponse>> {
    return this.get<UserProfileResponse>('/users/profile').pipe(
      map(result => ({
        ...result,
        data: result.data ? this.toHotelProfileResponse(result.data) : null,
      })),
    );
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
    sortBy: HotelTripSortBy = HotelTripSortBy.RequestedAt,
    status?: string,
    search?: string,
    skipLoading = false,
  ): Observable<Result<HotelTripsResponse>> {
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

    return this.get<HotelTripsResponse>('/hotels/trips', params, this.loadingContext(skipLoading));
  }

  getAllHotels(
    pageNumber: number,
    pageSize: number,
    sortBy: HotelFinancialSortBy = HotelFinancialSortBy.CreatedDate,
    sortDirection: SortDirection = SortDirection.Descending,
    status?: string,
    search?: string,
    skipLoading = false,
  ): Observable<Result<HotelsListResponse>> {
    let params = new HttpParams()
      .set('SortBy', sortBy)
      .set('SortDirection', sortDirection)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    if (status) {
      params = params.set('status', status);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.adminApi.get<HotelsListResponse>('/admin/hotels/financials', params, this.loadingContext(skipLoading));
  }

  getHotelById(hotelId: string): Observable<Result<HotelApiItem>> {
    return this.get<HotelApiItem>(`/hotels/${hotelId}`);
  }

  getCurrentUserHotelProfile(): Observable<Result<HotelApiItem>> {
    return this.get<UserProfileResponse>('/users/profile').pipe(
      map(result => ({
        ...result,
        data: result.data ? this.toHotelApiItem(result.data) : null,
      })),
    );
  }

  getHotelTripsById(
    hotelId: string,
    pageNumber: number,
    pageSize: number,
    status?: string,
    skipLoading = false,
  ): Observable<Result<HotelTripsResponse>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('hotelUserId', hotelId);

    if (status) {
      params = params.set('status', status);
    }

    return this.get<HotelTripsResponse>('/hotels/trips', params, this.loadingContext(skipLoading));
  }

  getTripRequestStatuses(): Observable<Result<TripRequestStatusesResponse>> {
    return this.get<TripRequestStatusesResponse>('/trip-request/all-status');
  }

  getPayoutAllStatuses(): Observable<Result<TripRequestStatusesResponse>> {
    return this.adminApi.get<TripRequestStatusesResponse>('/admin/hotels/payout-all-status');
  }

  getDashboardStats(
    fromDate: string,
    toDate: string,
    skipLoading = false,
  ): Observable<Result<DashboardStatsResponse>> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.adminApi.get<DashboardStatsResponse>('/admin/hotels/dashboard', params, this.loadingContext(skipLoading));
  }


  getHotelKpi(hotelId: string): Observable<Result<HotelKpiResponse>> {
     return this.get<HotelKpiResponse>(`/hotels/${hotelId}/kpi`); 
   }

  toggleBlockHotel(hotelId: string): Observable<Result<boolean>> {
    return this.adminApi.put<boolean>(`/admin/hotels/${hotelId}/toggle-block`, {});
  }

    updateHotelCommission(newCommission: number): Observable<Result<void>> {
      return this.adminApi.put<void>(`/admin/hotels/global-commission?newCommission=${newCommission}`, { newCommission });
    }

  getGlobalCommission(): Observable<Result<number>> {
    return this.adminApi.get<number>('/admin/hotels/global-commission');
  }

  getUnsettledPayouts(hotelId: string): Observable<Result<SettlementInfo>> {
    return this.adminApi.get<SettlementInfo>(`/admin/hotels/payouts/${hotelId}/last-settle-info`);
  }

  settleAllPayouts(hotelId: string): Observable<Result<void>> {
    return this.adminApi.put<void>(`/admin/hotels/payouts/${hotelId}/settle-all`, {});
  }

  private loadingContext(skipLoading: boolean): HttpContext | undefined {
    return skipLoading ? new HttpContext().set(SKIP_LOADING, true) : undefined;
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

  private toHotelApiItem(profile: UserProfileResponse): HotelApiItem {
    const configuration = profile.configuration;

    return {
      id: profile.id,
      hotelName: profile.userName,
      cityId: configuration?.cityId ?? '',
      address: configuration?.address ?? '',
      locationUrl: configuration?.locationUrl ?? '',
      latitude: configuration?.latitude ?? null,
      longitude: configuration?.longitude ?? null,
      phoneNumber: profile.phoneNumber,
      email: profile.email,
      logoUrl: configuration?.logoUrl ?? '',
      commissionRate: configuration?.commissionRate ?? 0,
      isActive: profile.isActive,
      isVerified: configuration?.isVerified ?? false,
      code: configuration?.code ?? '',
      isBlocked: configuration?.isBlocked ?? false,
    };
  }

  private toHotelProfileResponse(profile: UserProfileResponse): HotelProfileResponse {
    const configuration = profile.configuration;

    return {
      hotelId: profile.id,
      hotelName: profile.userName,
      address: configuration?.address ?? '',
      phoneNumber: profile.phoneNumber,
      email: profile.email,
      imageUrl: configuration?.logoUrl ?? null,
      isBlocked: configuration?.isBlocked ?? false,
    };
  }
}
export interface SettlementInfo {
  value: string | number;
  settelStatue?: SettlementStatus | keyof typeof SettlementStatus;
  settleStatue?: SettlementStatus | keyof typeof SettlementStatus;
  settleStatus?: SettlementStatus | keyof typeof SettlementStatus;
  status?: SettlementStatus | keyof typeof SettlementStatus;
  statusEnum?: SettlementStatus | string;
  statusString?: keyof typeof SettlementStatus | string;
}

export enum SettlementStatus {
  Pending,
  AwaitingPayout,
  Settled,
  Failed,
}
