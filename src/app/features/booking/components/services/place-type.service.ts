import { Injectable } from '@angular/core';
import { HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Result } from '../../../../core/models/result.model';
import { SKIP_LOADING } from '../../../../core/tokens/skip-loading.token';

export interface PlaceType {
  id: string;
  name: string;
}
export interface LocationItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface LocationsData {
  items: LocationItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface LocationsResponse {
 
    locations: LocationsData;
}
@Injectable({ providedIn: 'root' })
export class PlaceTypeService extends ApiService {
  getPlaceTypes(): Observable<Result<PlaceType[]>> {
    const context = new HttpContext().set(SKIP_LOADING, true);
    return this.get<PlaceType[]>('/place-types', undefined, context);
  }

    getdestinations(): Observable<Result<LocationsResponse>> {
    const context = new HttpContext().set(SKIP_LOADING, true);
    return this.get<LocationsResponse>('/hotels/drop-off-locations?pageNumber=1&pageSize=50', undefined, context);
  }
}
