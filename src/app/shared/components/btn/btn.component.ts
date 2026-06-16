/**
 * Shared reusable button — with optional loader and content projection.
 *
 * Usage:
 *   <!-- Simple primary button -->
 *   <app-btn (click)="save()">Save</app-btn>
 *
 *   <!-- Submit with loader -->
 *   <app-btn type="submit" [loading]="saving()" [showLoader]="true">Save Product</app-btn>
 *
 *   <!-- Danger button with icon inside -->
 *   <app-btn variant="danger" [loading]="deleting()">
 *     <app-icon name="trash" size="sm" /> Delete
 *   </app-btn>
 *
 *   <!-- Without loader (still disables during loading) -->
 *   <app-btn [loading]="busy()" [showLoader]="false">Working...</app-btn>
 *
 * Features:
 *   - variant: 'primary' | 'secondary' | 'danger' (styling)
 *   - size: 'sm' | 'md' | 'lg'
 *   - loading: shows spinner + disables button
 *   - showLoader: choice to show/hide spinner (default: true)
 *   - Content projection: put anything inside via <ng-content />
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-btn',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    class: 'inline-block',
    '[class.pointer-events-none]': 'isDisabled()',
    '[class.opacity-50]': 'isDisabled()',
  },
  templateUrl: './btn.component.html',
  styleUrl: './btn.component.css',
})
export class BtnComponent {
  /** HTML button type attribute */
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  /** Visual style variant */
  readonly variant = input<'primary' | 'secondary' | 'danger'>('primary');

  /** Size of the button */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Whether the button is in a loading state */
  readonly loading = input(false);

  /** Whether to show the spinner icon when loading (default: true) */
  readonly showLoader = input(true);

  /** Whether the button is disabled */
  readonly disabled = input(false);

  /** Combined disabled state — disabled when explicitly disabled OR loading */
  protected readonly isDisabled = computed(
    () => this.disabled() || this.loading(),
  );

  /** Computed Tailwind classes based on variant + size */
  protected readonly buttonClasses = computed(() => {
    const base =
      'inline-flex w-full items-center justify-center gap-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-page-bg disabled:cursor-not-allowed';

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    }[this.size()];

    const variantClasses = {
      primary:
        'bg-primary text-white hover:brightness-95',
      secondary:
        'border border-card-border bg-panel text-body hover:bg-hover',
      danger:
        'bg-danger text-white hover:brightness-95',
    }[this.variant()];

    return `${base} ${sizeClasses} ${variantClasses}`;
  });
}
