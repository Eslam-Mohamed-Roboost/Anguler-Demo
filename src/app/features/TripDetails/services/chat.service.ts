import { Injectable } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { Result } from '../../../core/models/result.model';
import type { ChatConversation } from '../models/chat-message.model';
import { SKIP_LOADING } from '../../../core/tokens/skip-loading.token';

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
  getChatHistory(tripRequestId: string, skipLoading = false): Observable<Result<ChatConversation>> {
    return this.get<ChatConversation>(`/trip-requests/${tripRequestId}/chat`, undefined, this.loadingContext(skipLoading));
  }

  sendMessage(tripRequestId: string, message: string, senderRole: string): Observable<Result<void>> {
    return this.post<void>(`/trip-requests/${tripRequestId}/chat/messages`, { message, senderRole });
  }

  closeConversation(tripRequestId: string): Observable<Result<void>> {
    return this.post<void>(`/trip-requests/${tripRequestId}/chat/close`, {});
  }

  getSideBarMessages(pageNumber: number = 1, pageSize: number = 50, skipLoading = false): Observable<Result<SideBarMessagesResponse>> {
    return this.get<SideBarMessagesResponse>(`/Chat/SideBarMessages?PageNumber=${pageNumber}&PageSize=${pageSize}`, undefined, this.loadingContext(skipLoading));
  }

   getSideBarMessagesCount(skipLoading = false): Observable<Result<number>> {
    return this.get<number>(`/Chat/GetUnReadCount`, undefined, this.loadingContext(skipLoading));
  }

  private loadingContext(skipLoading: boolean): HttpContext | undefined {
    return skipLoading ? new HttpContext().set(SKIP_LOADING, true) : undefined;
  }
}
