/**
 * Shared reusable select dropdown — integrates with Angular Signal Forms.
 *
 * Usage:
 *   <!-- Default browser arrow -->
 *   <app-select
 *     label="Category"
 *     inputId="category"
 *     [field]="fieldTree.category"
 *     [options]="categories"
 *     placeholder="Select a category"
 *   />
 *
 *   <!-- Custom styled arrow -->
 *   <app-select
 *     label="Category"
 *     inputId="category"
 *     [field]="fieldTree.category"
 *     [options]="categories"
 *     dropdownArrow="custom"
 *   />
 *
 *   <!-- No arrow -->
 *   <app-select
 *     label="Category"
 *     inputId="category"
 *     [field]="fieldTree.category"
 *     [options]="categories"
 *     dropdownArrow="none"
 *   />
 *
 *   <!-- With object options -->
 *   <app-select
 *     label="Role"
 *     inputId="role"
 *     [field]="fieldTree.role"
 *     [options]="roles"
 *     optionValue="id"
 *     optionLabel="name"
 *   />
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IconComponent } from '../icon/icon.component';

/**
 * Controls the dropdown arrow visibility for select inputs.
 *
 * - `'native'` — default browser arrow (default)
 * - `'custom'` — custom styled chevron-down icon
 * - `'none'`   — no arrow at all
 */
export type DropdownArrowMode = 'native' | 'custom' | 'none';

@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, IconComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
})
export class SelectComponent {
  /** Label text displayed above the select */
  readonly label = input('');

  /** Unique HTML id */
  readonly inputId = input.required<string>();

  /** Signal Forms field node */
  readonly field = input.required<unknown>();

  /** Placeholder shown as the disabled first option */
  readonly placeholder = input('');

  /** Array of options — strings or objects */
  readonly options = input.required<readonly unknown[]>();

  /** When options are objects, the property to use as the value */
  readonly optionValue = input('');

  /** When options are objects, the property to use as the display label */
  readonly optionLabel = input('');

  /** Optional hint text */
  readonly hint = input('');

  /** Extra CSS classes for the select element */
  readonly selectClass = input('');

  /**
   * Controls the dropdown arrow visibility.
   *
   * - `'native'` — default browser arrow (default)
   * - `'custom'` — custom styled chevron-down icon
   * - `'none'`   — no arrow at all
   */
  readonly dropdownArrow = input<DropdownArrowMode>('native');

  /** Determine if options are simple strings or objects */
  protected readonly isObjectOptions = computed(
    () => !!this.optionValue() && !!this.optionLabel(),
  );

  /** Whether to hide the native browser arrow */
  protected readonly hideNativeArrow = computed(
    () => this.dropdownArrow() !== 'native',
  );

  /** Whether to show the custom chevron icon */
  protected readonly showCustomArrow = computed(
    () => this.dropdownArrow() === 'custom',
  );

  protected readonly classes = computed(() => {
    const base =
      'w-full rounded border px-3 py-2 text-sm transition-colors placeholder:text-primary-text dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-400';

    const hideArrow = this.hideNativeArrow() ? 'hide-native-arrow' : '';
    const customPadding = this.showCustomArrow() ? 'pe-9' : '';
    const extra = this.selectClass();

    return [base, hideArrow, customPadding, extra].filter(Boolean).join(' ');
  });

  protected readonly touched = computed(() => {
    try { return (this.field() as any)?.()?.touched?.() ?? false; } catch { return false; }
  });

  protected readonly invalid = computed(() => {
    try { return (this.field() as any)?.()?.invalid?.() ?? false; } catch { return false; }
  });

  protected readonly errors = computed((): { message: string }[] => {
    try { return ((this.field() as any)?.()?.errors?.() ?? []) as { message: string }[]; } catch { return []; }
  });

  protected getValue(option: unknown): string {
    if (this.isObjectOptions()) {
      return String((option as Record<string, unknown>)[this.optionValue()]);
    }
    return String(option);
  }

  protected getLabel(option: unknown): string {
    if (this.isObjectOptions()) {
      return String((option as Record<string, unknown>)[this.optionLabel()]);
    }
    return String(option);
  }
}
