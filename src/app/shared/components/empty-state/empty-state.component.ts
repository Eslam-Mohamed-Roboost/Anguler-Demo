/**
 * Shared empty state — displays a placeholder when no data is available.
 * Animated with a subtle fade-in + slide-up on enter.
 *
 * Usage:
 *   <app-empty-state
 *     icon="package"
 *     title="No products found"
 *     description="Click 'Add Product' to create one."
 *   >
 *     <app-btn routerLink="new">Add Product</app-btn>
 *   </app-empty-state>
 */
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { IconComponent } from '../icon/icon.component';
import type { IconName } from '../icon/icon.component';

const ENTER_ANIMATION = trigger('fadeSlideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(12px)' }),
    animate('300ms cubic-bezier(0, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  animations: [ENTER_ANIMATION],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
})
export class EmptyStateComponent {
  /** Icon name to display */
  readonly icon = input<IconName | ''>('');

  /** Title text */
  readonly title = input('');

  /** Description text */
  readonly description = input('');
}
