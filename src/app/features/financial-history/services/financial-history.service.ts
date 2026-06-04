import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import type { Result } from '../../../core/models/result.model';
import {
  HotelFinancialItemType,
  type FinancialHistoryItem,
  type FinancialHistoryResponse,
  type FinancialHistoryQuery,
  type FinancialReportItem,
  type FinancialReportResponse,
} from '../models/financialHestory-model';
import { AdminApiService } from '../../../core/services/admin-api.service';

@Injectable({ providedIn: 'root' })
export class FinancialHistoryService {
  private readonly api = inject(ApiService);
  private readonly AdminApi = inject(AdminApiService);

  getFinancialHistory(query: FinancialHistoryQuery): Observable<Result<FinancialHistoryResponse>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);

    if (query.searchTerm) {
      params = params.set('searchTerm', query.searchTerm);
    }

    return this.api.get<FinancialReportResponse>('/hotels/financial-report', params).pipe(
      map((result) => ({
        ...result,
        data: result.data ? this.toFinancialHistoryResponse(result.data) : null,
      })),
    );
  }

  getGlobalCommission(): Observable<Result<number>> {
    return this.AdminApi.get<number>('/admin/hotels/global-commission');
  }

  private toFinancialHistoryResponse(response: FinancialReportResponse): FinancialHistoryResponse {
    return {
      items: response.items
        .map((item) => this.toFinancialHistoryItem(item))
        .filter((item): item is FinancialHistoryItem => item !== null),
      pageNumber: response.pageNumber,
      pageSize: response.pageSize,
      totalCount: response.totalCount,
      totalPages: response.totalPages,
    };
  }

  private toFinancialHistoryItem(item: FinancialReportItem): FinancialHistoryItem | null {
    if (item.itemType === HotelFinancialItemType.Trip && item.tripDetails) {
      const trip = item.tripDetails;
      return {
        itemType: HotelFinancialItemType.Trip,
        sequenceDate: item.sequenceDate,
        tripId: trip.tripId,
        tripCode: trip.tripCode,
        guestName: trip.guestName,
        roomNumber: trip.roomNumber,
        driverName: trip.driverName,
        hotelName: '',
        startLocation: trip.startLocation,
        endLocation: trip.endLocation,
        durationMinutes: trip.durationMinutes,
        distanceKm: trip.distanceKm,
        startDate: trip.startDate,
        endedAt: trip.endDate,
        fare: 0,
        hotelCommission: 0,
        platformCommission: trip.tripProfit,
        cumulativeProfit: trip.cumulativeProfit,
        driverPayout: 0,
        currency: trip.currency,
      };
    }

    if (item.itemType === HotelFinancialItemType.Banner && item.bannerDetails) {
      return {
        itemType: HotelFinancialItemType.Banner,
        sequenceDate: item.sequenceDate,
        payoutStatus: item.bannerDetails.payoutStatus,
        displayMessage: item.bannerDetails.displayMessage,
      };
    }

    return null;
  }
}
