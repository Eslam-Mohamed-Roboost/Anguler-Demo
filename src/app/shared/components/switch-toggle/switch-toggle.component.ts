/**
 * Modern toggle switch — custom styled with smooth slide animation.
 *
 * Usage:
 *   <app-switch-toggle
 *     label="Enable notifications"
 *     inputId="notifications"
 *     [field]="fieldTree.notifications"
 *   />
 *
 *   <app-switch-toggle label="Dark mode" inputId="dark" [field]="f.dark" size="lg" variant="success" />
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-switch-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField],
  templateUrl: './switch-toggle.component.html',
  styleUrl: './switch-toggle.component.css',
})
export class SwitchToggleComponent {
  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly field = input.required<unknown>();
  readonly description = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly variant = input<'primary' | 'success' | 'warning' | 'danger'>('primary');

  protected readonly sizeClasses = computed(() => {
    const s = this.size();
    return {
      track: s === 'sm' ? 'h-5 w-9' : s === 'lg' ? 'h-8 w-14' : 'h-6 w-11',
      thumb: s === 'sm' ? 'size-3.5' : s === 'lg' ? 'size-6' : 'size-4',
      label: s === 'sm' ? 'text-xs' : s === 'lg' ? 'text-base' : 'text-sm',
    };
  });

  /** CSS custom-property value used by the stylesheet to slide the thumb */
  protected readonly thumbOffset = computed(() => {
    switch (this.size()) {
      case 'sm': return '1rem';    /* translate-x-4 */
      case 'lg': return '1.5rem';  /* translate-x-6 */
      default:   return '1.25rem'; /* translate-x-5 */
    }
  });

  protected readonly colorClass = computed(() => {
    switch (this.variant()) {
      case 'success': return 'peer-checked:bg-green-500';
      case 'warning': return 'peer-checked:bg-amber-500';
      case 'danger': return 'peer-checked:bg-red-500';
      default: return 'peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500';
    }
  });
}
