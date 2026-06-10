import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ChatService } from '../../../features/TripDetails/services/chat.service';
import { BaseComponent } from '../../base/base.component';
import { AuthService } from '../../../core/services/auth.service';

export interface Message {
  id: string;
  tripRequestId?: string;
  tripID:string;
  tripRequestStatus?: number;
  sender: string;
  content: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-message-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe],
  templateUrl: './message-panel.component.html',
})
export class MessagePanelComponent extends BaseComponent implements OnInit {
  private readonly chatService = inject(ChatService);
  private readonly authService = inject(AuthService);
 
  /** Whether the panel is open */
  readonly isOpen = input<boolean>(false);

  /** Messages to display */
  readonly messages = input<Message[]>([]);

  /** Close panel event */
  readonly closePanel = output<void>();

  /** Message click event */
  readonly messageClick = output<Message>();

  /** Loading state */
  protected readonly loading = signal(false);

  /** Unread count */
  protected readonly unreadCount = signal(0);

  /** Expanded messages state */
  protected readonly expandedMessages = signal<Set<string>>(new Set());

  /** Local messages from API */
  protected readonly apiMessages = signal<Message[]>([]);

  private dataLoaded = false;

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

  ngOnInit(): void {
    if (this.dataLoaded) return;
    if (!this.authService.isAuthenticated()) return;
    this.dataLoaded = true;
    this.loadMessages();
    this.loadUnreadCount();
  }

  private loadMessages(): void {
    this.loading.set(true);
    this.chatService
      .getSideBarMessages(1, 50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          if (result.isSuccess && result.data?.messages?.items) {
            this.apiMessages.set(result.data.messages.items);
            this.unreadCount.set(result.data.unReadCount);
          }
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  private loadUnreadCount(): void {
    this.chatService
      .getSideBarMessagesCount()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data !== undefined) {
            this.unreadCount.set(result.data ?? 0);
          }
        },
      });
  }

  /** Get messages (use API data, input data, or default mock data) */
  protected getMessages(): Message[] {
    const inputMsgs = this.messages();
    if (inputMsgs.length > 0) return inputMsgs;

    const apiMsgs = this.apiMessages();
    if (apiMsgs.length > 0) return apiMsgs;

    return this.defaultMessages();
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

    if (this.apiMessages().length > 0) {
      this.apiMessages.set(updatedMessages);
    } else if (this.messages().length === 0) {
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

  protected statusLabel(message: Message): string {
    switch (message.tripRequestStatus) {
      case 0:
        return 'Waiting Driver';
      case 1:
      case 2:
      case 3:
        return 'Active';
      case 4:
        return 'Completed';
      case 5:
      case 6:
        return 'Cancelled';
      default:
        return message.read ? 'Completed' : 'Active';
    }
  }

  protected statusClass(message: Message): string {
    switch (this.statusLabel(message)) {
      case 'Active':
        return 'bg-status-active-bg text-status-active';
      case 'Waiting Driver':
        return 'bg-status-scheduled-bg text-status-scheduled';
      case 'Completed':
        return 'bg-[#F1F4F8] text-[#6B7C93]';
      case 'Cancelled':
        return 'bg-status-cancelled-bg text-status-cancelled';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  protected relativeTime(value: string): string {
    const time = new Date(value).getTime();
    if (!value || Number.isNaN(time)) return '0 min';

    const diffMinutes = Math.max(0, Math.floor((Date.now() - time) / 60000));
    if (diffMinutes < 60) return `${diffMinutes} min`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} h`;

    return `${Math.floor(diffHours / 24)} d`;
  }
}
