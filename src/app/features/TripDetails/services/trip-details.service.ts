import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AdminApiService } from '../../../core/services/admin-api.service';
import type { Result } from '../../../core/models/result.model';
import type { HotelInfo, TripDetailsResponse } from '../models/trip-details.model';

@Injectable({ providedIn: 'root' })
export class TripDetailsService extends ApiService {
  private readonly adminApi = inject(AdminApiService);

  /** Hotel-facing: load trip by tripRequestId (works before driver is assigned) */
  getTripByRequestId(tripRequestId: string): Observable<Result<TripDetailsResponse>> {
    return this.get<TripDetailsResponse>(`/trip-requests/${tripRequestId}/details`);
  }

  /** Admin-facing: load full trip data once a tripId is known */
  getTripDetails(tripId: string): Observable<Result<TripDetailsResponse>> {
    return this.adminApi.get<TripDetailsResponse>(`/admin/trips/${tripId}/details`);
  }

  acceptTrip(tripRequestId: string): Observable<Result<void>> {
    return this.put<void>(`/trip-request/accept`, { tripRequestId });
  }

  assignDriver(tripRequestId: string, driverId: string): Observable<Result<void>> {
    return this.adminApi.post<void>(
      `/admin/hotel-requests/${tripRequestId}/assign-driver`,
      { driverId },
    );
  }

  markArrived(tripRequestId: string): Observable<Result<void>> {
    return this.put<void>(`/trip-request/${tripRequestId}/arrived`, {});
  }

  startTrip(tripRequestId: string): Observable<Result<void>> {
    return this.put<void>(`/trip-request/${tripRequestId}/start`, {});
  }

  completeTrip(tripRequestId: string): Observable<Result<void>> {
    return this.put<void>(`/trip-request/${tripRequestId}/complete`, {});
  }

  cancelTrip(tripRequestId: string): Observable<Result<void>> {
    const CancellationReason =  'No reason provided';
    return this.put<void>(`/trip-request/${tripRequestId}/cancel-by-driver`, {tripRequestId, CancellationReason});
  }

  rescheduleTripRequest(tripRequestId: string, newScheduledAt: string): Observable<Result<void>> {
    return this.put<void>(`/trip-request/${tripRequestId}/reschedule`, { newScheduledAt });
  }

  getHotelById(hotelId: string): Observable<Result<HotelInfo>> {
    return this.get<HotelInfo>(`/hotels/${hotelId}`);
  }
}
