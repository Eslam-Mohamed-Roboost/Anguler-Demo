import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Result } from '../models/result.model';

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
  getAll(): Observable<Result<NotificationsResponse>> {
    return this.get<NotificationsResponse>('/GetNotifications/GetAll');
  }
    UnreadNotificationsCount(): Observable<Result<NotificationsCountResponse>> {
    return this.get<NotificationsCountResponse>('/GetNotifications/UnReadCount');
  }

}
