import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { DashboardOverview } from '../models/dashboard-overview.model';
import type { MetricType,   RevenueDataPointData } from '../models/RevenueDataPoint.model';
import type { Result } from '../../../core/models/result.model';

@Injectable({ providedIn: 'root' })
export class DashboardService extends ApiService{
 constructor() {
    super();
  }

 
  getOverview(): Observable<Result<DashboardOverview>> {
    return this.get<DashboardOverview>('/admin/dashboard/overview');
  }

  getRevenueChart(year: number, metricType: MetricType = 'TotalRevenue'): Observable<Result<RevenueDataPointData>> {
    return this.get<RevenueDataPointData>(`/admin/financial/revenue-chart?year=${year}&metricType=${metricType}`);
  }
}
 
