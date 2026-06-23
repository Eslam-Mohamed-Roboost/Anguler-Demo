import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { ChatMessageItem } from '../../models/chat-message.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import type { TranslationKey } from '../../../../core/i18n/translations';

@Component({
  selector: 'app-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent {
  readonly messages = input.required<ChatMessageItem[]>();
  readonly currentUserRole = input<string>('');
  readonly currentUserId = input<string>('');

  protected isMine(msg: ChatMessageItem): boolean {
    const senderId = msg.senderId?.trim();
    if (senderId === 'me') {
      return true;
    }

    const currentUserId = this.currentUserId().trim();
    if (currentUserId && senderId) {
      return senderId === currentUserId;
    }

    const myRole = this.normalizeRole(this.currentUserRole());
    const senderRole = this.normalizeRole(msg.senderRole);
    return !!myRole && senderRole === myRole;
  }

  protected roleLabelKey(role: string): TranslationKey {
    return `tripDetails.role.${this.displayRole(role)}` as TranslationKey;
  }

  protected formatDateTime(value: string): string {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  private normalizeRole(role: string): string {
    if (role.includes('مشرف')) return 'admin';
    if (role.includes('فندق')) return 'hotel';
    if (role.includes('راكب')) return 'passenger';
    if (role.includes('سائق')) return 'driver';

    const normalized = role.toLowerCase().replace(/[^a-z]/g, '');
    if (normalized.includes('admin')) return 'admin';
    if (normalized.includes('hotel')) return 'hotel';
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

    return roleMap[normalized] ?? 'Unknown';
  }
}
