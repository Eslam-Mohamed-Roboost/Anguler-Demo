import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { distinctUntilChanged } from 'rxjs';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { MessageComponent } from '../message/message.component';
import type { ChatConversation } from '../../models/chat-message.model';
import { ChatService } from '../../services/chat.service';
import { BaseComponent } from '../../../../shared/base/base.component';

@Component({
  selector: 'app-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, ChatInputComponent, MessageComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent extends BaseComponent implements OnInit {
  private readonly chatService = inject(ChatService);

  readonly tripRequestId = input.required<string>();

  protected readonly conversation = signal<ChatConversation | null>(null);
  protected readonly isOpen = computed(() => this.conversation()?.status === 'Open');
  protected readonly chatLoading = signal(false);
  protected readonly sendLoading = signal(false);
  protected readonly closeLoading = signal(false);
  private lastLoadedId = '';

  ngOnInit(): void {
    this.loadChat();
  }

  private loadChat(): void {
    const id = this.tripRequestId();
    if (!id || id === this.lastLoadedId) return;

    this.lastLoadedId = id;
    this.chatLoading.set(true);
    this.chatService.getChatHistory(id).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.conversation.set(result.data);
        }
        this.chatLoading.set(false);
      },
      error: () => this.chatLoading.set(false),
    });
  }

  protected onSend(text: string): void {
    const id = this.tripRequestId();
    if (!text.trim() || !id) return;

    this.sendLoading.set(true);
    this.chatService.sendMessage(id, text).subscribe({
      next: () => {
        this.sendLoading.set(false);
        this.loadChat();
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
        this.loadChat();
      },
      error: () => this.closeLoading.set(false),
    });
  }
}
