/**
 * Copy-to-clipboard directive — copies text on click and shows a toast notification.
 *
 * Usage:
 *   <button [appCopyToClipboard]="'some-uuid-string'">Copy ID</button>
 *   <code [appCopyToClipboard]="apiKey">{{ apiKey }}</code>
 *
 * SSR-safe: no clipboard API access during server-side rendering.
 */
import {
  Directive,
  inject,
  input,
  output,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NotificationStore } from '../../core/stores/notification.store';

@Directive({
  selector: '[appCopyToClipboard]',
  host: {
    '(click)': 'copy()',
    'style': 'cursor: pointer;',
  },
})
export class CopyToClipboardDirective {
  /** Text to copy to clipboard */
  readonly appCopyToClipboard = input.required<string>();

  /** Optional custom success message */
  readonly copySuccessMessage = input('Copied to clipboard!');

  /** Emits when text is successfully copied */
  readonly copied = output<string>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly notifications = inject(NotificationStore);

  async copy(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const text = this.appCopyToClipboard();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      this.notifications.showSuccess(this.copySuccessMessage(), 2000);
      this.copied.emit(text);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.notifications.showSuccess(this.copySuccessMessage(), 2000);
      this.copied.emit(text);
    }
  }
}
