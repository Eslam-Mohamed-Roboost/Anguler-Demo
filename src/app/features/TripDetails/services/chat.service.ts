import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { Result } from '../../../core/models/result.model';
import type { ChatConversation } from '../models/chat-message.model';

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
}
