/**
 * Individual menu item inside DropdownMenuComponent.
 *
 * Usage:
 *   <app-dropdown-item (action)="edit()">Edit</app-dropdown-item>
 *   <app-dropdown-item (action)="delete()" variant="danger">Delete</app-dropdown-item>
 *   <app-dropdown-item [disabled]="true">Disabled</app-dropdown-item>
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { DropdownMenuComponent } from './dropdown-menu.component';

@Component({
  selector: 'app-dropdown-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="menuitem"
      [disabled]="disabled()"
      [class]="classes()"
      (click)="onClick()"
    >
      <ng-content />
    </button>
  `,
})
export class DropdownItemComponent {
  /** Color variant */
  readonly variant = input<'default' | 'danger'>('default');

  /** Whether the item is disabled */
  readonly disabled = input(false);

  /** Emitted when the item is clicked */
  readonly action = output<void>();

  private readonly dropdown = inject(DropdownMenuComponent);

  protected readonly classes = computed(() => {
    const base =
      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
    const variantClass = this.variant() === 'danger'
      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700';
    return `${base} ${variantClass}`;
  });

  protected onClick(): void {
    if (!this.disabled()) {
      this.action.emit();
      this.dropdown.close();
    }
  }
}
