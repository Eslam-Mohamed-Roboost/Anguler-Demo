import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Result } from '../../../core/models/result.model';
import { TripDetailsResponse } from '../models/trip-details.model';

@Injectable({ providedIn: 'root' })
export class TripDetailsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.adminApiUrl;

  getTripDetails(tripId: string): Observable<Result<TripDetailsResponse>> {
    return this.http.get<Result<TripDetailsResponse>>(
      `${this.baseUrl}/admin/trips/${tripId}/details`
    );
  }
}
