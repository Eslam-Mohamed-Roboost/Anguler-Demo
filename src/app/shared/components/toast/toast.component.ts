// Global toast notification — supports stacked, multi-type toasts
// Animated with Angular animations: slide-in from right on enter, slide-out on leave
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { NotificationStore } from '../../../core/stores/notification.store';
import type { NotificationType } from '../../../core/stores/notification.store';
import { IconComponent } from '../icon/icon.component';
import type { IconName } from '../icon/icon.component';

const TOAST_ANIMATION = trigger('toastSlide', [
  transition(':enter', [
    style({ transform: 'translateX(120%)', opacity: 0 }),
    animate(
      '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ transform: 'translateX(0)', opacity: 1 }),
    ),
  ]),
  transition(':leave', [
    animate(
      '200ms cubic-bezier(0.4, 0, 1, 1)',
      style({ transform: 'translateX(120%)', opacity: 0 }),
    ),
  ]),
]);

const TYPE_CLASSES: Record<NotificationType, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-600 text-white',
};

const TYPE_ICONS: Record<NotificationType, IconName> = {
  success: 'check-circle',
  error: 'alert-triangle',
  warning: 'alert-triangle',
  info: 'info',
};

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  animations: [TOAST_ANIMATION],
  template: `
    <div
      class="fixed top-4 right-4 z-50 flex flex-col gap-2 rtl:right-auto rtl:left-4"
      aria-live="polite"
    >
      @for (notification of store.notifications(); track notification.id) {
        <div
          @toastSlide
          role="alert"
          class="flex max-w-sm items-center gap-2 rounded px-4 py-3 shadow-lg"
          [class]="typeClasses(notification.type)"
        >
          <span class="inline-flex shrink-0">
            <app-icon [name]="typeIcon(notification.type)" size="sm" />
          </span>
          <p class="flex-1 text-sm">{{ notification.message }}</p>
          <button
            type="button"
            (click)="store.dismiss(notification.id)"
            class="shrink-0 opacity-80 hover:opacity-100"
            aria-label="Close notification"
            i18n-aria-label="@@toast.closeLabel"
          >
            <app-icon name="close" size="sm" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  protected readonly store = inject(NotificationStore);

  protected typeClasses(type: NotificationType): string {
    return TYPE_CLASSES[type];
  }

  protected typeIcon(type: NotificationType): IconName {
    return TYPE_ICONS[type];
  }
}
