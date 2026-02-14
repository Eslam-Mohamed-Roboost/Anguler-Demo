/**
 * Password input with show/hide toggle and strength meter.
 *
 * Usage:
 *   <app-password-input
 *     label="Password"
 *     inputId="password"
 *     [field]="fieldTree.password"
 *     [showStrength]="true"
 *   />
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-password-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, IconComponent],
  templateUrl: './password-input.component.html',
  styleUrl: './password-input.component.css',
})
export class PasswordInputComponent {
  readonly label = input('');
  readonly inputId = input.required<string>();
  readonly field = input.required<unknown>();
  readonly placeholder = input('');
  readonly hint = input('');
  readonly showStrength = input(false);

  /** Extra CSS classes appended to the input element. */
  readonly inputClass = input('');

  /** Extra CSS classes for placeholder styling (use Tailwind `placeholder:` prefix). */
  readonly placeholderClass = input('');

  /** Extra CSS classes appended to the label element. */
  readonly labelClass = input('');

  protected readonly visible = signal(false);
  protected readonly passwordValue = signal('');

  protected readonly inputType = computed(() => (this.visible() ? 'text' : 'password'));

  protected readonly classes = computed(() => {
    const base =
      'w-full rounded border border-gray-300 py-2 pl-3 pr-10 text-sm transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400';
    const extra = this.inputClass();
    const phClass = this.placeholderClass();
    return [base, extra, phClass].filter(Boolean).join(' ');
  });

  protected toggleVisibility(): void {
    this.visible.update((v) => !v);
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.passwordValue.set(value);
  }

  protected readonly strength = computed(() => {
    const pwd = this.passwordValue();
    if (!pwd) return { score: 0, label: '', color: '', width: '0%' };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    const levels: { label: string; color: string }[] = [
      { label: 'Very weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-amber-500' },
      { label: 'Good', color: 'bg-lime-500' },
      { label: 'Strong', color: 'bg-green-500' },
    ];

    const idx = Math.min(score, levels.length) - 1;
    const level = idx >= 0 ? levels[idx] : levels[0];
    const width = `${(score / 5) * 100}%`;

    return { score, label: level.label, color: level.color, width };
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
