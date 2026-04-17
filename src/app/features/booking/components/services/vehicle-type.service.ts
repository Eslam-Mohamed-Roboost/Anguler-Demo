import { Injectable } from '@angular/core';
import { HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Result } from '../../../../core/models/result.model';
import { SKIP_LOADING } from '../../../../core/tokens/skip-loading.token';

export interface VehicleTypeItem {
  id: string;
  name: string;
  capacity: number;
  expectedPrice: number;
  expectedPriceAfterDiscount: number | null;
  estimatedTimeInMinutes: number;
}

@Injectable({ providedIn: 'root' })
export class VehicleTypeService extends ApiService {
  getAll(km: number): Observable<Result<VehicleTypeItem[]>> {
    const params = new HttpParams().set('Km', km.toString());
    const context = new HttpContext().set(SKIP_LOADING, true);
    return this.get<VehicleTypeItem[]>('/vehicle-type-with-expected-price/getall', params, context);
  }
}
