import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { AvatarComponent } from '../avatar/avatar.component';

export interface Message {
  id: string;
  tripID:string;
  sender: string;
  content: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-message-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, AvatarComponent],
  templateUrl: './message-panel.component.html',
})
export class MessagePanelComponent {
  /** Whether the panel is open */
  readonly isOpen = input<boolean>(false);

  /** Messages to display */
  readonly messages = input<Message[]>([]);

  /** Close panel event */
  readonly closePanel = output<void>();

  /** Message click event */
  readonly messageClick = output<Message>();

  /** Expanded messages state */
  protected readonly expandedMessages = signal<Set<string>>(new Set());

  /** Default mock messages if no messages provided */
  protected readonly defaultMessages = signal<Message[]>([
    {
      id: '1',
      tripID: 'TRIP-001',
      sender: 'Front Desk',
      content: 'Your room is ready for check-in. The key card is available at the front desk. Please let us know if you need any assistance with your luggage.',
      time: '2 hours ago',
      read: false
    },
    {
      id: '2',
      tripID: 'TRIP-002',
      sender: 'Concierge',
      content: 'Your airport transfer has been confirmed for tomorrow at 10:00 AM. The driver will meet you at the hotel lobby. Vehicle details: Mercedes-Benz E-Class, license plate ABC-123.',
      time: '5 hours ago',
      read: false
    },
    {
      id: '3',
      tripID: 'TRIP-003',
      sender: 'Housekeeping',
      content: 'Room cleaning completed. We have refreshed your towels and restocked the minibar. Is there anything else you need for your comfort?',
      time: '1 day ago',
      read: true
    },
    {
      id: '4',
      tripID: 'TRIP-004',
      sender: 'Restaurant',
      content: 'Your dinner reservation for tonight at 7:30 PM is confirmed. Table for 2 near the window. Please inform us of any dietary restrictions.',
      time: '2 days ago',
      read: true
    },
    {
      id: '5',
      tripID: 'TRIP-005',
      sender: 'Spa & Wellness',
      content: 'Special offer: 20% off on all spa treatments this week. Book now and enjoy our signature massage therapy session.',
      time: '3 days ago',
      read: true
    },
    {
      id: '6',
      tripID: 'TRIP-006',
      sender: 'Security',
      content: 'Package delivery notice: A package has arrived for you. Please collect it from the security desk at your convenience.',
      time: '4 days ago',
      read: true
    }
  ]);

  /** Get messages (use provided data or default mock data) */
  protected getMessages(): Message[] {
    const msgs = this.messages();
    return msgs.length > 0 ? msgs : this.defaultMessages();
  }

  /** Close panel */
  protected onClose(): void {
    this.closePanel.emit();
  }

  /** Handle message click */
  protected onMessageClick(message: Message): void {
    // Mark as read
    const updatedMessages = this.getMessages().map(msg => 
      msg.id === message.id ? { ...msg, read: true } : msg
    );
    // Update the signal if using default data
    if (this.messages().length === 0) {
      this.defaultMessages.set(updatedMessages);
    }
    this.messageClick.emit(message);
  }

  /** Get unread count */
  protected getUnreadCount(): number {
    return this.getMessages().filter(msg => !msg.read).length;
  }

  /** Mark all as read */
  protected markAllAsRead(): void {
    const updatedMessages = this.getMessages().map(msg => ({ ...msg, read: true }));
    // Update the signal if using default data
    if (this.messages().length === 0) {
      this.defaultMessages.set(updatedMessages);
    }
    console.log('All messages marked as read');
  }

  /** Toggle message expansion */
  protected toggleMessageExpansion(message: Message): void {
    const current = new Set(this.expandedMessages());
    if (current.has(message.id)) {
      current.delete(message.id);
    } else {
      current.add(message.id);
    }
    this.expandedMessages.set(current);
  }

  /** Check if message is expanded */
  protected isMessageExpanded(message: Message): boolean {
    return this.expandedMessages().has(message.id);
  }
}
