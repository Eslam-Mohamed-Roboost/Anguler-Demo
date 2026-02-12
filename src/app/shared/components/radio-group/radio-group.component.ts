/**
 * Modern styled radio group — fully custom design with smooth animations.
 *
 * Hides native radio inputs and renders custom circles with an animated
 * inner dot, focus ring, and accessible labels.
 *
 * Usage:
 *   <app-radio-group
 *     label="Status"
 *     inputId="status"
 *     [field]="fieldTree.status"
 *     [options]="['active', 'inactive', 'draft']"
 *   />
 *
 *   <!-- Object options + horizontal layout -->
 *   <app-radio-group
 *     label="Priority"
 *     inputId="priority"
 *     [field]="fieldTree.priority"
 *     [options]="priorities"
 *     optionValue="id"
 *     optionLabel="name"
 *     layout="horizontal"
 *   />
 *
 *   <!-- Sizes & colors -->
 *   <app-radio-group ... size="lg" variant="success" />
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
  selector: 'app-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, IconComponent],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.css',
})
export class RadioGroupComponent {
  /** Group label */
  readonly label = input('');

  /** Base HTML id — each radio gets `{inputId}-{index}` */
  readonly inputId = input.required<string>();

  /** Signal Forms field node */
  readonly field = input.required<unknown>();

  /** Array of options — strings or objects */
  readonly options = input.required<readonly unknown[]>();

  /** Property key for the value when options are objects */
  readonly optionValue = input('');

  /** Property key for the display label when options are objects */
  readonly optionLabel = input('');

  /** Layout direction */
  readonly layout = input<'vertical' | 'horizontal'>('vertical');

  /** Optional hint text */
  readonly hint = input('');

  /** Size variant */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Color variant */
  readonly variant = input<'primary' | 'success' | 'warning' | 'danger'>('primary');

  /* ── Derived state ──────────────────────────────────────── */

  protected readonly isObjectOptions = computed(
    () => !!this.optionValue() && !!this.optionLabel(),
  );

  protected readonly layoutClass = computed(() =>
    this.layout() === 'horizontal'
      ? 'flex flex-wrap gap-x-5 gap-y-3'
      : 'flex flex-col gap-3',
  );

  protected readonly sizeClasses = computed(() => {
    const s = this.size();
    return {
      outer: s === 'sm' ? 'size-4' : s === 'lg' ? 'size-6' : 'size-5',
      inner: s === 'sm' ? 'size-1.5' : s === 'lg' ? 'size-2.5' : 'size-2',
      label: s === 'sm' ? 'text-xs' : s === 'lg' ? 'text-base' : 'text-sm',
      gap: s === 'sm' ? 'gap-2' : s === 'lg' ? 'gap-3' : 'gap-2.5',
    };
  });

  protected readonly colorClasses = computed(() => {
    switch (this.variant()) {
      case 'success': return {
        border: 'peer-checked:border-green-500 dark:peer-checked:border-green-500',
        ring: 'peer-focus-visible:ring-green-500/25',
        dot: 'bg-green-500',
      };
      case 'warning': return {
        border: 'peer-checked:border-amber-500 dark:peer-checked:border-amber-500',
        ring: 'peer-focus-visible:ring-amber-500/25',
        dot: 'bg-amber-500',
      };
      case 'danger': return {
        border: 'peer-checked:border-red-500 dark:peer-checked:border-red-500',
        ring: 'peer-focus-visible:ring-red-500/25',
        dot: 'bg-red-500',
      };
      default: return {
        border: 'peer-checked:border-blue-600 dark:peer-checked:border-blue-500',
        ring: 'peer-focus-visible:ring-blue-500/25',
        dot: 'bg-blue-600 dark:bg-blue-500',
      };
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

  protected radioId(index: number): string {
    return `${this.inputId()}-${index}`;
  }
}
