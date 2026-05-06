/**
 * Shared reusable input component — integrates with Angular Signal Forms.
 *
 * Encapsulates the label, input/textarea element, hint text, custom content,
 * and validation error display in a single reusable wrapper.
 *
 * Usage examples:
 *
 *   <!-- Basic text input -->
 *   <app-input
 *     label="Name"
 *     inputId="user-name"
 *     [field]="fieldTree.name"
 *     placeholder="Enter name"
 *   />
 *
 *   <!-- Number input — native arrows (default) -->
 *   <app-input
 *     label="Price ($)"
 *     inputId="product-price"
 *     type="number"
 *     step="0.01"
 *     [field]="fieldTree.price"
 *   />
 *
 *   <!-- Number input — no arrows -->
 *   <app-input
 *     label="Quantity"
 *     inputId="qty"
 *     type="number"
 *     [field]="fieldTree.quantity"
 *     spinButtons="none"
 *   />
 *
 *   <!-- Number input — custom styled arrows -->
 *   <app-input
 *     label="Quantity"
 *     inputId="qty"
 *     type="number"
 *     [field]="fieldTree.quantity"
 *     spinButtons="custom"
 *   />
 *
 *   <!-- Textarea (rows > 0) -->
 *   <app-input
 *     label="Description"
 *     inputId="product-desc"
 *     [field]="fieldTree.description"
 *     [rows]="4"
 *   />
 *
 *   <!-- Disabled input -->
 *   <app-input
 *     label="Read-only field"
 *     inputId="readonly-field"
 *     [field]="fieldTree.readonly"
 *     [disabled]="true"
 *   />
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  effect,
  viewChild,
  ElementRef,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * Controls the spin button visibility for number inputs.
 *
 * - `'native'` — show the default browser arrows (default)
 * - `'custom'` — show custom styled chevron arrows
 * - `'none'`   — hide all arrows completely
 */
export type SpinButtonMode = 'native' | 'custom' | 'none';

@Component({
  selector: 'app-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
})
export class InputComponent {
  /* ── Inputs ──────────────────────────────────────────────── */

  /** Label text displayed above the input. Supports i18n-label. */
  readonly label = input('');

  /** Unique HTML id — used for label[for] and input[id]. */
  readonly inputId = input.required<string>();

  /** HTML input type (ignored when rows > 0). */
  readonly type = input<string>('text');

  /** Placeholder text. Supports i18n-placeholder. */
  readonly placeholder = input('');

  /** Optional hint displayed below the input. */
  readonly hint = input('');

  /** Signal Forms field node — bound to [formField] and used for error state. */
  readonly field = input.required<unknown>();

  /** Step attribute for number inputs. */
  readonly step = input('');

  /** When > 0 renders a <textarea> instead of <input>. */
  readonly rows = input(0);

  /** Extra CSS classes appended to the input/textarea element. */
  readonly inputClass = input('');

  /** Extra CSS classes for placeholder styling (use Tailwind `placeholder:` prefix). */
  readonly placeholderClass = input('');

  /** Extra CSS classes appended to the label element. */
  readonly labelClass = input('');

  /** Whether the input should be disabled */
  readonly disabled = input(false);

  /**
   * Controls number input arrow visibility.
   *
   * - `'native'` — default browser arrows (default)
   * - `'custom'` — custom styled chevron arrows
   * - `'none'`   — no arrows at all
   *
   * Ignored for non-number types.
   */
  readonly spinButtons = input<SpinButtonMode>('native');

  /* ── View queries ─────────────────────────────────────────── */

  protected readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputEl');
  protected readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaEl');

  /* ── Derived state ────────────────────────────────────────── */

  protected readonly isTextarea = computed(() => this.rows() > 0);

  protected readonly isNumber = computed(() => this.type() === 'number' && !this.isTextarea());

  /** Whether to hide native spin buttons via CSS class */
  protected readonly hideNativeSpinners = computed(
    () => this.isNumber() && this.spinButtons() !== 'native',
  );

  /** Whether to show our custom spin buttons */
  protected readonly showCustomSpinners = computed(
    () => this.isNumber() && this.spinButtons() === 'custom',
  );

  protected readonly touched = computed(() => {
    const node = this.field();
    try {
      // Handle signal forms field structure
      if (node && typeof node === 'object' && 'model' in node) {
        return (node as any).touched?.() ?? false;
      }
      // Handle legacy structure
      return (node as any)?.()?.touched?.() ?? false;
    } catch {
      return false;
    }
  });

  protected readonly invalid = computed(() => {
    const node = this.field();
    try {
      // Handle signal forms field structure
      if (node && typeof node === 'object' && 'model' in node) {
        return (node as any).invalid?.() ?? false;
      }
      if (typeof node === 'function') {
        return (node as any)()?.invalid?.() ?? false;
      }
      return false;
    } catch {
      return false;
    }
  });

  protected readonly errors = computed((): { message: string }[] => {
    const node = this.field();
    try {
      // Handle signal forms field structure
      if (node && typeof node === 'object' && 'model' in node) {
        return ((node as any).errors?.() ?? []) as { message: string }[];
      }
      if (typeof node === 'function') {
        return (((node as any)()?.errors?.() ?? []) as { message: string }[]);
      }
      return [];
    } catch {
      return [];
    }
  });

  protected readonly classes = computed(() => {
    const base =
      'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-400';

    const spinClass = this.hideNativeSpinners() ? 'hide-spin-buttons' : '';
    const customSpinPadding = this.showCustomSpinners() ? 'pe-9' : '';
    const extra = this.inputClass();
    const phClass = this.placeholderClass();

    return [base, spinClass, customSpinPadding, extra, phClass].filter(Boolean).join(' ');
  });

  /* ── Custom spin button methods ───────────────────────────── */

  constructor() {
    effect(() => {
      const isDisabled = this.disabled();
      const inputEl = this.inputRef()?.nativeElement;
      if (inputEl) {
        inputEl.disabled = isDisabled;
      }
      const textareaEl = this.textareaRef()?.nativeElement;
      if (textareaEl) {
        textareaEl.disabled = isDisabled;
      }
    });
  }

  protected onFieldBlur(): void {
    const field = this.field();
    try {
      // Handle signal forms field structure
      if (field && typeof field === 'object' && 'markAsTouched' in field) {
        (field as any).markAsTouched?.();
      }
      // Handle legacy structure
      else if (field && typeof field === 'object' && 'touched' in field) {
        const touched = (field as any).touched;
        if (touched && typeof touched === 'function') {
          touched.set(true);
        }
      }
    } catch (error) {
      console.warn('Failed to mark field as touched:', error);
    }
  }

  protected increment(): void {
    const el = this.inputRef()?.nativeElement;
    if (el) {
      el.stepUp();
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  protected decrement(): void {
    const el = this.inputRef()?.nativeElement;
    if (el) {
      el.stepDown();
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
