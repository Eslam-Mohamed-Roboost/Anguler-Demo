import { Injectable } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Result } from '../models/result.model';
import { SKIP_LOADING } from '../tokens/skip-loading.token';

export interface NotificationItem {
  id: string;
  message: string;
  createdDate: string;
  isRead: boolean;
}
interface NotificationsCountResponse {
  count: number;
}

export interface NotificationsResponse {
    notifications: {
      items: NotificationItem[];
    };
}

@Injectable({ providedIn: 'root' })
export class NotificationsService extends ApiService {
  getAll(skipLoading = false): Observable<Result<NotificationsResponse>> {
    return this.get<NotificationsResponse>('/GetNotifications/GetAll', undefined, this.loadingContext(skipLoading));
  }

  UnreadNotificationsCount(skipLoading = false): Observable<Result<NotificationsCountResponse>> {
    return this.get<NotificationsCountResponse>('/GetNotifications/UnReadCount', undefined, this.loadingContext(skipLoading));
  }

  markAsRead(id: string): Observable<Result<boolean>> {
    return this.put<boolean>(`/notifications/read?Id=${encodeURIComponent(id)}`, {});
  }

  private loadingContext(skipLoading: boolean): HttpContext | undefined {
    return skipLoading ? new HttpContext().set(SKIP_LOADING, true) : undefined;
  }
}
