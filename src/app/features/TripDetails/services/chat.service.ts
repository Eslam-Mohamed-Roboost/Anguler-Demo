import { Injectable } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import type { Result } from '../../../core/models/result.model';
import type { ChatConversation } from '../models/chat-message.model';
import { SKIP_LOADING } from '../../../core/tokens/skip-loading.token';

export interface SideBarMessage {
  id: string;
  tripRequestId: string;
  tripID: string;
  tripRequestStatus: number;
  sender: string;
  content: string;
  time: string;
  read: boolean;
}

export interface SideBarMessageApiItem {
  tripRequestId: string;
  tripCode: string | null;
  tripRequestStatus: number;
  message: string | null;
  senderRole: string | null;
  isRead: boolean;
  sentAt: string;
}

export interface SideBarMessagesResponse {
  messages: {
    items: SideBarMessage[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  unReadCount: number;
}

interface SideBarMessagesApiResponse {
  messages: {
    items: SideBarMessageApiItem[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  unReadCount: number;
}

@Injectable({ providedIn: 'root' })
export class ChatService extends ApiService {
  getChatHistory(tripRequestId: string, skipLoading = false): Observable<Result<ChatConversation>> {
    return this.get<ChatConversation>(`/trip-requests/${tripRequestId}/chat`, undefined, this.loadingContext(skipLoading));
  }

  sendMessage(tripRequestId: string, message: string, senderRole: string, skipLoading = false): Observable<Result<void>> {
    return this.post<void>(
      `/trip-requests/${tripRequestId}/chat/messages`,
      { message, senderRole },
      this.loadingContext(skipLoading),
    );
  }

  closeConversation(tripRequestId: string): Observable<Result<void>> {
    return this.post<void>(`/trip-requests/${tripRequestId}/chat/close`, {});
  }

  getSideBarMessages(pageNumber: number = 1, pageSize: number = 50, skipLoading = false): Observable<Result<SideBarMessagesResponse>> {
    return this.get<SideBarMessagesApiResponse>(`/Chat/SideBarMessages?PageNumber=${pageNumber}&PageSize=${pageSize}`, undefined, this.loadingContext(skipLoading))
      .pipe(map((result) => ({
        ...result,
        data: result.data ? this.toSideBarMessagesResponse(result.data) : null,
      })));
  }

   getSideBarMessagesCount(skipLoading = false): Observable<Result<number>> {
    return this.get<number>(`/Chat/GetUnReadCount`, undefined, this.loadingContext(skipLoading));
  }

  private loadingContext(skipLoading: boolean): HttpContext | undefined {
    return skipLoading ? new HttpContext().set(SKIP_LOADING, true) : undefined;
  }

  private toSideBarMessagesResponse(data: SideBarMessagesApiResponse): SideBarMessagesResponse {
    return {
      messages: {
        ...data.messages,
        items: data.messages.items.map((item) => this.toSideBarMessage(item)),
      },
      unReadCount: data.unReadCount,
    };
  }

  private toSideBarMessage(item: SideBarMessageApiItem): SideBarMessage {
    return {
      id: `${item.tripRequestId}-${item.sentAt}`,
      tripRequestId: item.tripRequestId,
      tripID: item.tripCode || '--',
      tripRequestStatus: item.tripRequestStatus,
      sender: item.senderRole || '--',
      content: item.message || '',
      time: item.sentAt,
      read: item.isRead,
    };
  }
}
