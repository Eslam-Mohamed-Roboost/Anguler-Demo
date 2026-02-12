/**
 * Reusable content card with header/body/footer slots.
 *
 * Usage:
 *   <app-card>
 *     <h3 card-header>Title</h3>
 *     <p>Card body content goes here.</p>
 *     <div card-footer>Footer actions</div>
 *   </app-card>
 *
 *   <app-card variant="elevated" [padding]="false">
 *     <app-image ... />
 *   </app-card>
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent {
  /** Visual variant */
  readonly variant = input<'default' | 'elevated' | 'outlined'>('default');

  /** Whether to apply body padding */
  readonly padding = input(true);

  protected readonly cardClasses = computed(() => {
    const base = 'overflow-hidden rounded-lg transition-shadow';
    const variantClass = {
      default: 'border bg-white dark:border-gray-700 dark:bg-gray-800',
      elevated: 'bg-white shadow-md hover:shadow-lg dark:bg-gray-800',
      outlined: 'border-2 border-dashed border-gray-300 bg-transparent dark:border-gray-600',
    }[this.variant()];
    return `${base} ${variantClass}`;
  });

  protected readonly bodyClasses = computed(() =>
    this.padding() ? 'px-4 py-4' : '',
  );
}
