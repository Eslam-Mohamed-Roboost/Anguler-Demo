import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { MessageComponent } from '../message/message.component';
import type { ChatMessage } from '../../models/chat-message.model';

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'user',
    senderName: 'Lines',
    text: 'Hi. I was charged $5.00 as a cancellation fee for my last ride (ID: 55B3R),',
    timestamp: '04:45 PM',
  },
  {
    id: '2',
    sender: 'agent',
    senderName: 'Salam Hotel',
    text: "Hello! I'm Sarah, and I'd be happy to check that for you.",
    timestamp: '04:45 PM',
  },
];

@Component({
  selector: 'app-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, ChatInputComponent, MessageComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  protected readonly messages = signal<ChatMessage[]>(MOCK_MESSAGES);

  protected onSend(text: string): void {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      senderName: 'Lines',
      text,
      timestamp,
    };
    this.messages.update((msgs) => [...msgs, newMessage]);
  }
}
