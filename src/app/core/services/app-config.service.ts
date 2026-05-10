import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { SKIP_LOADING } from '../tokens/skip-loading.token';
import { Result } from '../models/result.model';
import { AdminApiService } from './admin-api.service';
import { NotificationStore } from '../stores/notification.store';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService extends AdminApiService {
  private readonly notifications = inject(NotificationStore);
  private readonly commissionValue = signal<number>(2); // Default fallback value

  readonly commissionPercentage = computed(() => this.commissionValue());

  constructor() {
    super();
    this.loadCommissionFromApi();
  }

  private loadCommissionFromApi(): void {
    const context = new HttpContext().set(SKIP_LOADING, true);
    this.get<number>('/admin/hotels/global-commission', undefined, context)
      .pipe(
        catchError((error) => {
          this.notifications.showError('Failed to load commission configuration.');
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result?.isSuccess && result.data !== null && result.data !== undefined) {
          this.commissionValue.set(result.data);
        }
      });
  }

  setCommissionPercentage(percentage: number): void {
    this.commissionValue.set(percentage);
  }
}
