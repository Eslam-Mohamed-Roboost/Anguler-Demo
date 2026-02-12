/**
 * Horizontal divider line inside DropdownMenuComponent.
 *
 * Usage:
 *   <app-dropdown-divider />
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dropdown-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<hr class="my-1 border-gray-200 dark:border-gray-700" role="separator" />`,
})
export class DropdownDividerComponent {}
