/**
 * Accessible dropdown action menu triggered by a button.
 *
 * Usage:
 *   <app-dropdown-menu>
 *     <button trigger>Actions</button>
 *
 *     <app-dropdown-item (action)="onEdit()">
 *       <app-icon name="edit" size="sm" /> Edit
 *     </app-dropdown-item>
 *     <app-dropdown-divider />
 *     <app-dropdown-item (action)="onDelete()" variant="danger">
 *       <app-icon name="trash" size="sm" /> Delete
 *     </app-dropdown-item>
 *   </app-dropdown-menu>
 */
import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

const MENU_ANIMATION = trigger('menuAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95) translateY(-4px)' }),
    animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
  ]),
  transition(':leave', [
    animate('75ms ease-in', style({ opacity: 0, transform: 'scale(0.95) translateY(-4px)' })),
  ]),
]);

@Component({
  selector: 'app-dropdown-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClickOutsideDirective],
  animations: [MENU_ANIMATION],
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.css',
})
export class DropdownMenuComponent {
  protected readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
