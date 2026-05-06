import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { Result } from '../../../core/models/result.model';
import type { ChatConversation } from '../models/chat-message.model';

export interface SideBarMessage {
  id: string;
  tripID: string;
  sender: string;
  content: string;
  time: string;
  read: boolean;
}

export interface SideBarMessagesResponse {
  messages: {
    items: SideBarMessage[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ChatService extends ApiService {
  getChatHistory(tripRequestId: string): Observable<Result<ChatConversation>> {
    return this.get<ChatConversation>(`/trip-requests/${tripRequestId}/chat`);
  }

  sendMessage(tripRequestId: string, message: string): Observable<Result<void>> {
    return this.post<void>(`/trip-requests/${tripRequestId}/chat/messages`, { message });
  }

  closeConversation(tripRequestId: string): Observable<Result<void>> {
    return this.post<void>(`/trip-requests/${tripRequestId}/chat/close`, {});
  }

  getSideBarMessages(pageNumber: number = 1, pageSize: number = 50): Observable<Result<SideBarMessagesResponse>> {
    return this.get<SideBarMessagesResponse>(`/Chat/SideBarMessages?PageNumber=${pageNumber}&PageSize=${pageSize}`);
  }

   getSideBarMessagesCount(): Observable<Result<number>> {
    return this.get<number>(`/Chat/GetUnReadCount`);
  }
}
