/**
 * Determinate/indeterminate progress bar with label and percentage.
 *
 * Usage:
 *   <!-- Determinate -->
 *   <app-progress-bar [value]="75" label="Uploading..." />
 *
 *   <!-- Indeterminate -->
 *   <app-progress-bar [indeterminate]="true" label="Loading..." />
 *
 *   <!-- Custom color + size -->
 *   <app-progress-bar [value]="40" variant="success" size="lg" [showPercent]="true" />
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css',
})
export class ProgressBarComponent {
  /** Progress value (0–100). Ignored when indeterminate. */
  readonly value = input(0);

  /** Whether the progress is indeterminate (unknown completion %). */
  readonly indeterminate = input(false);

  /** Optional label displayed above the bar. */
  readonly label = input('');

  /** Whether to show the percentage text. */
  readonly showPercent = input(false);

  /** Color variant. */
  readonly variant = input<'primary' | 'success' | 'warning' | 'danger'>('primary');

  /** Size variant. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly clampedValue = computed(() =>
    Math.max(0, Math.min(100, this.value())),
  );

  protected readonly barHeight = computed(() => {
    const map = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
    return map[this.size()];
  });

  protected readonly barColor = computed(() => {
    const map = {
      primary: 'bg-blue-600 dark:bg-blue-500',
      success: 'bg-green-600 dark:bg-green-500',
      warning: 'bg-amber-500 dark:bg-amber-400',
      danger: 'bg-red-600 dark:bg-red-500',
    };
    return map[this.variant()];
  });

  protected readonly trackColor = 'bg-gray-200 dark:bg-gray-700';
}
