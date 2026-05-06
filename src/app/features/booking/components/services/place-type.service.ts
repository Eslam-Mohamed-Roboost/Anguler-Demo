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

@Injectable({ providedIn: 'root' })
export class PlaceTypeService extends ApiService {
  getPlaceTypes(): Observable<Result<PlaceType[]>> {
    const context = new HttpContext().set(SKIP_LOADING, true);
    return this.get<PlaceType[]>('/place-types', undefined, context);
  }
}
