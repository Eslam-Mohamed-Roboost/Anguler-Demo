import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { distinctUntilChanged } from 'rxjs';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { MessageComponent } from '../message/message.component';
import type { ChatConversation } from '../../models/chat-message.model';
import { ChatService } from '../../services/chat.service';
import { BaseComponent } from '../../../../shared/base/base.component';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import type { TranslationKey } from '../../../../core/i18n/translations';

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

  readonly tripRequestId = input.required<string>();
  readonly chatError = output<boolean>();

  protected readonly conversation = signal<ChatConversation | null>(null);
  protected readonly isOpen = computed(() => this.conversation()?.status === 'Open');
  protected readonly chatLoading = signal(false);
  protected readonly sendLoading = signal(false);
  protected readonly closeLoading = signal(false);
  protected readonly currentUserRole = computed(() => {
    const roles = this.authService.userRoles();
    if (roles.includes('hotel')) return 'Hotel';
    if (roles.includes('admin')) return 'Admin';
    if (roles.includes('driver')) return 'Driver';
    return roles[0] ?? '';
  });
  protected readonly conversationStatusKey = computed(() =>
    this.statusTranslationKey(this.conversation()?.status ?? '')
  );
  private lastLoadedId = '';

  ngOnInit(): void {
    this.loadChat();
  }

  private loadChat(): void {
    const id = this.tripRequestId();
    if (!id || id === this.lastLoadedId) return;

    this.lastLoadedId = id;
    this.fetchChat(id, true);
  }

  private refreshChat(): void {
    const id = this.tripRequestId();
    if (!id) return;
    this.fetchChat(id, false);
  }

  private fetchChat(id: string, showLoading: boolean): void {
    if (showLoading) this.chatLoading.set(true);
    this.chatService.getChatHistory(id).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.conversation.set(result.data);
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
    const id = this.tripRequestId();
    if (!text.trim() || !id) return;

    // Optimistically add message to UI
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      senderId: 'me',
      senderRole: this.currentUserRole(),
      message: text.trim(),
      createdAt: new Date().toISOString(),
    };
    this.conversation.update(conv => {
      if (!conv) {
        return {
          conversationId: '',
          tripId: id,
          conversationType: 'Trip',
          status: 'Open',
          createdAt: new Date().toISOString(),
          closedAt: null,
          messages: [optimisticMessage],
        };
      }
      return { ...conv, messages: [...conv.messages, optimisticMessage] };
    });

    this.sendLoading.set(true);
    this.chatService.sendMessage(id, text).subscribe({
      next: () => {
        this.sendLoading.set(false);
        this.refreshChat();
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
}
