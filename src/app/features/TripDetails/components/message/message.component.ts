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

  protected isMine(msg: ChatMessageItem): boolean {
    const myRole = this.currentUserRole().toLowerCase();
    return !!myRole && msg.senderRole?.toLowerCase() === myRole;
  }

  protected roleLabelKey(role: string): TranslationKey {
    return `tripDetails.role.${role || 'Unknown'}` as TranslationKey;
  }
}
