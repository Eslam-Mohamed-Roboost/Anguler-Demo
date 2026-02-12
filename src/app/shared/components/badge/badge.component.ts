/**
 * Shared reusable badge — displays status labels with color variants.
 *
 * Usage:
 *   <app-badge variant="success">Active</app-badge>
 *   <app-badge variant="danger" size="sm">Inactive</app-badge>
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
})
export class BadgeComponent {
  readonly variant = input<'success' | 'danger' | 'warning' | 'info' | 'neutral'>('neutral');
  readonly size = input<'sm' | 'md'>('sm');

  protected readonly classes = computed(() => {
    const sizeClass = this.size() === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

    const variantClass = {
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    }[this.variant()];

    return `inline-flex items-center rounded-full font-medium ${sizeClass} ${variantClass}`;
  });
}
