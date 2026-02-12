// Global overlay spinner — visible when debounced loading signal is true
// Animated with fade-in/out
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { LoadingEffect } from '../../../core/effects/loading.effect';

const FADE_ANIMATION = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-out', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0 })),
  ]),
]);

@Component({
  selector: 'app-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [FADE_ANIMATION],
  template: `
    @if (loadingEffect.showSpinner()) {
      <div
        @fadeInOut
        class="fixed inset-0 z-40 flex items-center justify-center bg-black/20"
        role="status"
        aria-busy="true"
      >
        <div
          class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400"
        ></div>
        <span class="sr-only" i18n="@@spinner.loading">Loading…</span>
      </div>
    }
  `,
})
export class SpinnerComponent {
  protected readonly loadingEffect = inject(LoadingEffect);
}
