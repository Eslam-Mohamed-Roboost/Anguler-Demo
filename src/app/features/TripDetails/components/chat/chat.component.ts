import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { timer } from 'rxjs';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { MessageComponent } from '../message/message.component';
import type { ChatConversation, ChatMessageItem } from '../../models/chat-message.model';
import { ChatService } from '../../services/chat.service';
import { BaseComponent } from '../../../../shared/base/base.component';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import type { TranslationKey } from '../../../../core/i18n/translations';
import { RealTimeService } from '../../../../core/services/real-time.service';
import { NotificationSoundService } from '../../../../core/services/notification-sound.service';

const CHAT_REFRESH_MS = 5_000;

@Component({
  selector: 'app-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, ChatInputComponent, MessageComponent, TranslatePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent extends BaseComponent implements OnInit {
  private readonly chatService = inject(ChatService);
  private readonly authService = inject(AuthService);
  private readonly messagesContainer = viewChild<ElementRef<HTMLElement>>('messagesContainer');
  private readonly realTimeService = inject(RealTimeService);
  private readonly notificationSound = inject(NotificationSoundService);
  readonly tripRequestId = input.required<string>();
  readonly senderRole = input<string | null>(null);
  readonly chatError = output<boolean>();

  protected readonly conversation = signal<ChatConversation | null>(null);
  protected readonly isOpen = computed(() => this.conversation()?.status === 'Open');
  protected readonly chatLoading = signal(false);
  protected readonly sendLoading = signal(false);
  protected readonly closeLoading = signal(false);
  protected readonly currentUserRole = computed(() => {
    const explicitRole = this.senderRole();
    if (explicitRole) return this.displayRole(explicitRole);

    const roles = this.authService.userRoles();
    if (roles.some(role => this.normalizeRole(role) === 'admin')) return 'Admin';
    if (roles.some(role => this.normalizeRole(role) === 'hotel')) return 'Hotel';
    if (roles.some(role => this.normalizeRole(role) === 'driver')) return 'Driver';
    return roles[0] ? this.displayRole(roles[0]) : '';
  });
  protected readonly currentUserId = computed(() => {
    const userId = this.authService.user()?.id;
    if (userId && userId !== 0) return String(userId);

    const profile = this.authService.profile();
    const profileId = this.profileString(profile, 'id')
      || this.profileString(profile, 'hotelId')
      || this.profileString(profile, 'userId')
      || this.profileString(profile, 'accountId');

    return profileId;
  });
  protected readonly conversationStatusKey = computed(() =>
    this.statusTranslationKey(this.conversation()?.status ?? '')
  );
  private lastLoadedId = '';
  private readonly seenMessageIds = new Set<string>();
  private chatHistoryInitialized = false;

  ngOnInit(): void {
    this.loadChat();
    this.startChatPolling();
    this.realTimeService.startConnection();
    this.realTimeService.addMessageListener();
  }

  private loadChat(): void {
    const id = this.tripRequestId();
    if (!id || id === this.lastLoadedId) return;

    this.seenMessageIds.clear();
    this.chatHistoryInitialized = false;
    this.lastLoadedId = id;
    this.fetchChat(id, true);
  }

  private refreshChat(): void {
    const id = this.tripRequestId();
    if (!id) return;
    this.fetchChat(id, false, true);
  }

  private startChatPolling(): void {
    timer(CHAT_REFRESH_MS, CHAT_REFRESH_MS)
      .pipe(this.takeUntilDestroyed())
      .subscribe(() => {
        const id = this.tripRequestId();
        if (!id) return;

        if (id !== this.lastLoadedId) {
          this.loadChat();
          return;
        }

        this.refreshChat();
      });
  }

  private fetchChat(id: string, showLoading: boolean, skipGlobalLoading = false): void {
    if (showLoading) this.chatLoading.set(true);
    this.chatService.getChatHistory(id, skipGlobalLoading).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.notifyForIncomingMessages(result.data.messages);
          this.conversation.set(result.data);
          this.scrollMessagesToBottom();
        } else if (showLoading) {
          this.chatError.emit(true);
        }
        if (showLoading) this.chatLoading.set(false);
      },
      error: () => {
        if (showLoading) {
          this.chatLoading.set(false);
          this.chatError.emit(true);
        }
      },
    });
  }

  protected onSend(text: string): void {
    this.notificationSound.unlock();
    const id = this.tripRequestId();
    const messageText = text.trim();
    if (!messageText || !id || this.sendLoading()) return;

    this.sendLoading.set(true);
    const senderRole = this.optimisticSenderRole();

    this.chatService.sendMessage(id, messageText, senderRole, true).subscribe({
      next: () => {
        this.sendLoading.set(false);
        this.appendSentMessage(id, messageText, senderRole);
      },
      error: () => this.sendLoading.set(false),
    });
  }

  protected closeConversation(): void {
    const id = this.tripRequestId();
    if (!id) return;
    this.closeLoading.set(true);
    this.chatService.closeConversation(id).subscribe({
      next: () => {
        this.closeLoading.set(false);
        this.refreshChat();
      },
      error: () => this.closeLoading.set(false),
    });
  }

  private statusTranslationKey(status: string): TranslationKey {
    return `tripDetails.chatStatus.${status || 'Unknown'}` as TranslationKey;
  }

  private normalizeRole(role: string): string {
    const normalized = role.toLowerCase().replace(/[^a-z]/g, '');
    if (normalized.includes('hotel')) return 'hotel';
    if (normalized.includes('admin')) return 'admin';
    if (normalized.includes('driver')) return 'driver';
    if (normalized.includes('passenger')) return 'passenger';
    return normalized;
  }

  private displayRole(role: string): string {
    const normalized = this.normalizeRole(role);
    const roleMap: Record<string, string> = {
      hotel: 'Hotel',
      admin: 'Admin',
      driver: 'Driver',
      passenger: 'Passenger',
    };

    return roleMap[normalized] ?? role;
  }

  private optimisticSenderRole(): string {
    const currentRole = this.currentUserRole();
    return this.normalizeRole(currentRole) === 'passenger' ? 'Hotel' : this.displayRole(currentRole);
  }

  private appendSentMessage(tripId: string, message: string, senderRole: string): void {
    const sentMessage = {
      id: `sent-${Date.now()}`,
      senderId: 'me',
      senderRole,
      message,
      createdAt: new Date().toISOString(),
    };

    this.conversation.update(conv => {
      if (!conv) {
        return {
          conversationId: '',
          tripId,
          conversationType: 'Trip',
          status: 'Open',
          createdAt: new Date().toISOString(),
          closedAt: null,
          messages: [sentMessage],
        };
      }

      return { ...conv, messages: [...conv.messages, sentMessage] };
    });
    this.seenMessageIds.add(sentMessage.id);
    this.scrollMessagesToBottom();
  }

  private notifyForIncomingMessages(messages: ChatMessageItem[]): void {
    const hasNewIncomingMessage = messages.some(message => {
      const messageId = this.messageKey(message);
      return !this.seenMessageIds.has(messageId) && !this.isCurrentUserMessage(message);
    });

    this.seenMessageIds.clear();
    for (const message of messages) {
      this.seenMessageIds.add(this.messageKey(message));
    }

    if (!this.chatHistoryInitialized) {
      this.chatHistoryInitialized = true;
      return;
    }

    if (hasNewIncomingMessage) {
      this.notificationSound.play('message');
    }
  }

  private isCurrentUserMessage(message: ChatMessageItem): boolean {
    const senderId = message.senderId?.trim();
    if (senderId === 'me') return true;

    const currentUserId = this.currentUserId().trim();
    if (currentUserId && senderId) {
      return senderId === currentUserId;
    }

    const currentRole = this.normalizeRole(this.currentUserRole());
    const senderRole = this.normalizeRole(message.senderRole);
    return !!currentRole && currentRole === senderRole;
  }

  private messageKey(message: ChatMessageItem): string {
    return message.id || `${message.senderId}|${message.senderRole}|${message.createdAt}|${message.message}`;
  }

  private profileString(profile: Record<string, unknown> | null, key: string): string {
    const value = profile?.[key];
    return typeof value === 'string' && value.trim() ? value.trim() : '';
  }

  private scrollMessagesToBottom(): void {
    queueMicrotask(() => {
      const container = this.messagesContainer()?.nativeElement;
      if (!container) return;

      const scroll = () => {
        container.scrollTop = container.scrollHeight;
      };

      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(scroll);
      } else {
        scroll();
      }
    });
  }
}
