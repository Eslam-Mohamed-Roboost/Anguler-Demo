import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Result } from '../../../../core/models/result.model';

export interface TripLocation {
  latitude: number;
  longitude: number;
  address: string;
  order: number;
}

export interface CreateTripRequest {
  startLocation: TripLocation;
  endLocations: TripLocation[];
  isScheduled: boolean;
  scheduledAt: string | null;
  vehicleTypeId: string;
  paymentMethodId: string | null;
  estimatedPrice: number;
  distance: number;
  userRewardId: string | null;
  paymentMethodType: number;
  roomNumber: number;
  guestName: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class TripRequestService extends ApiService {
  create(body: CreateTripRequest): Observable<Result<unknown>> {
    return this.post<unknown>('/trip-request/create', body);
  }

  cancelTrip(tripRequestId: string, cancellationReason: string): Observable<Result<void>> {
    return this.put<void>('/trip-request/cancel', { tripRequestId, cancellationReason });
  }

  rescheduleTrip(tripRequestId: string, newScheduledAt: string): Observable<Result<void>> {
    return this.put<void>(`/trip-request/${tripRequestId}/reschedule`, { newScheduledAt });
  }
}
