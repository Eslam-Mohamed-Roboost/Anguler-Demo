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
  readonly variant = input<'default' | 'elevated' | 'outlined' | 'booking'>('default');

  /** Whether to apply body padding */
  readonly padding = input(true);

  /** Whether to show the header slot */
  readonly showHeader = input(true);

  /** Extra CSS classes for the card wrapper */
  readonly cardClass = input('');

  /** Extra CSS classes for the body section */
  readonly bodyClass = input('');

  protected readonly cardClasses = computed(() => {
    const base = this.variant() === 'booking' 
      ? 'overflow-hidden rounded-2xl transition-shadow' 
      : 'overflow-hidden rounded-lg transition-shadow';
    const variantClass = {
      default: 'border border-card-border bg-panel text-body',
      elevated: 'bg-panel text-body shadow-md hover:shadow-lg',
      outlined: 'border-2 border-dashed border-card-border bg-transparent text-body',
      booking: 'bg-panel/90 text-body shadow-2xl backdrop-blur-md',
    }[this.variant()];
    const extra = this.cardClass();
    return [base, variantClass, extra].filter(Boolean).join(' ');
  });

  protected readonly bodyClasses = computed(() => {
    const padding = this.padding()
      ? (this.variant() === 'booking' ? 'px-6 py-6' : 'px-4 py-4')
      : '';
    const extra = this.bodyClass();
    return [padding, extra].filter(Boolean).join(' ');
  });
}
