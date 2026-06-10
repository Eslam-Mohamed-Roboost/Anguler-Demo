import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Result } from '../../../../core/models/result.model';

export interface DistanceInfoRequest {
  originLatitude: number;
  originLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  vehicleId: string;
}

export interface DistanceInfo {
  distanceInMeters: number;
  durationInSeconds: number;
  estimatedCost: number;
}

@Injectable({ providedIn: 'root' })
export class MapsService extends ApiService {
  getDistanceInfo(payload: DistanceInfoRequest): Observable<Result<DistanceInfo>> {
    return this.post<DistanceInfo>('/maps/distance-info', payload);
  }
}
