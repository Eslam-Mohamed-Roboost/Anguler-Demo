/**
 * Range slider component with label, min/max, and current value display.
 *
 * Uses model() for two-way binding (simpler than formField for range inputs).
 *
 * Usage:
 *   <app-slider label="Volume" inputId="volume" [(value)]="volume" [min]="0" [max]="100" />
 *   <app-slider label="Price" inputId="price" [(value)]="price" [min]="0" [max]="1000" [step]="10" />
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';

@Component({
  selector: 'app-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
})
export class SliderComponent {
  readonly label = input('');
  readonly inputId = input.required<string>();
  readonly value = model(0);
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly showValue = input(true);
  readonly hint = input('');
  readonly variant = input<'primary' | 'success' | 'warning' | 'danger'>('primary');

  protected onInput(event: Event): void {
    this.value.set(+(event.target as HTMLInputElement).value);
  }

  protected readonly percent = computed(() => {
    const mn = this.min();
    const mx = this.max();
    const range = mx - mn;
    if (range <= 0) return 0;
    return ((this.value() - mn) / range) * 100;
  });

  protected readonly accentClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'accent-green-500';
      case 'warning': return 'accent-amber-500';
      case 'danger': return 'accent-red-500';
      default: return 'accent-blue-600 dark:accent-blue-500';
    }
  });
}
