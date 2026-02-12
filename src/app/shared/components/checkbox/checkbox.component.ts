/**
 * Modern styled checkbox — fully custom design with smooth animations.
 *
 * Hides the native checkbox and renders a custom box with an animated
 * check-mark SVG, focus ring, and accessible label/description.
 *
 * Usage:
 *   <app-checkbox
 *     label="Accept terms"
 *     i18n-label="@@form.accept"
 *     inputId="accept"
 *     [field]="fieldTree.accept"
 *     description="You must agree to continue"
 *   />
 *
 *   <!-- Sizes -->
 *   <app-checkbox label="Small" inputId="sm" [field]="f.small" size="sm" />
 *   <app-checkbox label="Large" inputId="lg" [field]="f.large" size="lg" />
 *
 *   <!-- Color variants -->
 *   <app-checkbox label="Success" inputId="ok" [field]="f.ok" variant="success" />
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, IconComponent],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
})
export class CheckboxComponent {
  /** Label text */
  readonly label = input.required<string>();

  /** Unique HTML id */
  readonly inputId = input.required<string>();

  /** Signal Forms field node */
  readonly field = input.required<unknown>();

  /** Optional description text shown below the label */
  readonly description = input('');

  /** Size variant */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Color variant */
  readonly variant = input<'primary' | 'success' | 'warning' | 'danger'>('primary');

  /** Whether this checkbox is disabled */
  readonly disabled = input(false);

  /* ── Derived state ──────────────────────────────────────── */

  protected readonly sizeClasses = computed(() => {
    const s = this.size();
    return {
      box: s === 'sm' ? 'size-4' : s === 'lg' ? 'size-6' : 'size-5',
      icon: (s === 'sm' ? 'xs' : s === 'lg' ? 'sm' : 'xs') as 'xs' | 'sm',
      label: s === 'sm' ? 'text-xs' : s === 'lg' ? 'text-base' : 'text-sm',
      gap: s === 'sm' ? 'gap-2' : s === 'lg' ? 'gap-3' : 'gap-2.5',
    };
  });

  protected readonly colorClasses = computed(() => {
    switch (this.variant()) {
      case 'success': return 'peer-checked:border-green-500 peer-checked:bg-green-500 dark:peer-checked:border-green-500 dark:peer-checked:bg-green-500 peer-focus-visible:ring-green-500/25';
      case 'warning': return 'peer-checked:border-amber-500 peer-checked:bg-amber-500 dark:peer-checked:border-amber-500 dark:peer-checked:bg-amber-500 peer-focus-visible:ring-amber-500/25';
      case 'danger': return 'peer-checked:border-red-500 peer-checked:bg-red-500 dark:peer-checked:border-red-500 dark:peer-checked:bg-red-500 peer-focus-visible:ring-red-500/25';
      default: return 'peer-checked:border-blue-600 peer-checked:bg-blue-600 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500 peer-focus-visible:ring-blue-500/25';
    }
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
}
