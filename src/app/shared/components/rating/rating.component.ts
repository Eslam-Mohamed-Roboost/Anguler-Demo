/**
 * Star rating component — interactive or read-only.
 *
 * Usage:
 *   <app-rating [(value)]="rating" [max]="5" />
 *   <app-rating [value]="3.5" [readonly]="true" size="sm" />
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.css',
})
export class RatingComponent {
  readonly value = model(0);
  readonly max = input(5);
  readonly readonly = input(false);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly label = input('');
  readonly variant = input<'yellow' | 'red' | 'blue'>('yellow');

  protected readonly hoveredIndex = model(-1);

  protected readonly stars = computed(() => {
    const m = this.max();
    return Array.from({ length: m }, (_, i) => i + 1);
  });

  protected readonly iconSize = computed(() => {
    const s = this.size();
    return s === 'sm' ? 'sm' as const : s === 'lg' ? 'lg' as const : 'md' as const;
  });

  protected readonly colorClasses = computed(() => {
    switch (this.variant()) {
      case 'red': return { filled: 'text-red-500', empty: 'text-gray-300 dark:text-gray-600' };
      case 'blue': return { filled: 'text-blue-500', empty: 'text-gray-300 dark:text-gray-600' };
      default: return { filled: 'text-yellow-400', empty: 'text-gray-300 dark:text-gray-600' };
    }
  });

  protected starClass(index: number): string {
    const hovered = this.hoveredIndex();
    const current = this.value();
    const active = hovered >= 0 ? index <= hovered : index <= current;
    return active ? this.colorClasses().filled : this.colorClasses().empty;
  }

  protected onMouseEnter(index: number): void {
    if (!this.readonly()) this.hoveredIndex.set(index);
  }

  protected onMouseLeave(): void {
    this.hoveredIndex.set(-1);
  }

  protected onClick(index: number): void {
    if (this.readonly()) return;
    this.value.set(this.value() === index ? 0 : index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.readonly()) return;
    const m = this.max();
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.value.update((v) => Math.min(m, v + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.value.update((v) => Math.max(0, v - 1));
    }
  }
}
