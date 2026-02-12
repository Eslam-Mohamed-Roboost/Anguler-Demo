/**
 * Reusable form section wrapper — replaces manual <fieldset> boilerplate.
 *
 * Usage:
 *   <app-form-group legend="Basic Information">
 *     <app-input ... />
 *     <app-input ... />
 *   </app-form-group>
 *
 *   <app-form-group legend="Pricing" [collapsible]="true" [collapsed]="false">
 *     <app-input ... />
 *   </app-form-group>
 */
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-form-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './form-group.component.html',
  styleUrl: './form-group.component.css',
})
export class FormGroupComponent {
  /** Legend / section title */
  readonly legend = input.required<string>();

  /** Optional description below the legend */
  readonly description = input('');

  /** Whether the section can be collapsed */
  readonly collapsible = input(false);

  /** Initial collapsed state (only applies when collapsible is true) */
  readonly collapsed = input(false);

  protected readonly isCollapsed = signal<boolean | null>(null);

  protected get actuallyCollapsed(): boolean {
    const explicit = this.isCollapsed();
    if (explicit !== null) return explicit;
    return this.collapsible() && this.collapsed();
  }

  protected toggle(): void {
    if (!this.collapsible()) return;
    this.isCollapsed.set(!this.actuallyCollapsed);
  }
}
