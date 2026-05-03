import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { Result } from '../../../core/models/result.model';
import type { FinancialHistoryResponse, FinancialHistoryQuery } from '../models/financialHestory-model';

@Injectable({ providedIn: 'root' })
export class FinancialHistoryService {
  private readonly api = inject(ApiService);

  getFinancialHistory(query: FinancialHistoryQuery): Observable<Result<FinancialHistoryResponse>> {
    let params = new HttpParams()
      .set('pageNumber', query.pageNumber)
      .set('pageSize', query.pageSize);

    if (query.fromDate) {
      params = params.set('fromDate', query.fromDate);
    }

    if (query.toDate) {
      params = params.set('toDate', query.toDate);
    }

    return this.api.get<FinancialHistoryResponse>('/financial-history', params);
  }
}
