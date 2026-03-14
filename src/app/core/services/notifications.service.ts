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

export interface NotificationsData {
  notifications: NotificationItem[];
}

@Injectable({ providedIn: 'root' })
export class NotificationsService extends ApiService {
  getAll(): Observable<Result<NotificationsData>> {
    return this.get<NotificationsData>('/GetNotifications/GetAll');
  }
}
