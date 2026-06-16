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
  readonly variant = input<'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'scheduled'>('neutral');
  readonly size = input<'sm' | 'md'>('sm');

  protected readonly classes = computed(() => {
    const isScheduled = this.variant() === 'scheduled';
    const sizeClass = isScheduled
      ? this.size() === 'sm'
        ? 'px-3.5 py-1 text-xs'
        : 'px-4 py-1.5 text-sm'
      : this.size() === 'sm'
        ? 'px-2 py-0.5 text-xs'
        : 'px-2.5 py-1 text-sm';
    const radiusClass = isScheduled ? 'rounded-[10px]' : 'rounded-full';
    const weightClass = isScheduled ? 'font-bold' : 'font-medium';

    const variantClass = {
      success: 'bg-status-completed-bg text-status-completed',
      danger: 'bg-status-cancelled-bg text-status-cancelled',
      warning: 'bg-status-scheduled-bg text-status-scheduled',
      info: 'bg-blue-light text-blue',
      neutral: 'bg-input-bg text-body-soft',
      scheduled: 'bg-status-scheduled-bg text-status-scheduled',
    }[this.variant()];

    return `inline-flex items-center ${radiusClass} ${weightClass} ${sizeClass} ${variantClass}`;
  });
}
