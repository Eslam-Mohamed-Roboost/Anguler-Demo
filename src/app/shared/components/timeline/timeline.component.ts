/**
 * Vertical timeline for activity logs, history, or step-based display.
 *
 * Usage:
 *   <app-timeline [items]="activityLog" />
 *
 *   Where activityLog is:
 *   [
 *     { title: 'Order placed', description: 'Order #123 was placed', time: '2026-01-15', icon: 'package', variant: 'success' },
 *     { title: 'Payment received', time: '2026-01-15', variant: 'info' },
 *     { title: 'Shipped', time: '2026-01-16', icon: 'check', variant: 'primary' },
 *   ]
 */
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import type { IconName } from '../icon/icon.component';

export interface TimelineItem {
  /** Title text */
  title: string;
  /** Optional description */
  description?: string;
  /** Time label (displayed as-is — use RelativeTimePipe in the parent if needed) */
  time?: string;
  /** Optional icon */
  icon?: IconName;
  /** Color variant for the dot/icon */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
}

@Component({
  selector: 'app-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.css',
})
export class TimelineComponent {
  /** Timeline items */
  readonly items = input.required<readonly TimelineItem[]>();

  protected dotClasses(variant: string | undefined): string {
    const base = 'flex size-8 shrink-0 items-center justify-center rounded-full';
    const colorMap: Record<string, string> = {
      primary: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
      success: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
      warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
      danger: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
      neutral: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
    };
    return `${base} ${colorMap[variant ?? 'neutral'] ?? colorMap['neutral']}`;
  }
}
