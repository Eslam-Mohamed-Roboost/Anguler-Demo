/**
 * Modern date picker with custom calendar dropdown, month/year navigation,
 * keyboard support, and smooth animations.
 *
 * Usage:
 *   <app-date-picker
 *     label="Start Date"
 *     inputId="start-date"
 *     [field]="fieldTree.startDate"
 *     placeholder="Select a date..."
 *   />
 *
 *   <app-date-picker
 *     label="Delivery Date"
 *     inputId="delivery"
 *     [field]="fieldTree.deliveryDate"
 *     [minDate]="today"
 *     maxDate="2026-12-31"
 *     variant="success"
 *   />
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormField } from '@angular/forms/signals';
import { IconComponent } from '../icon/icon.component';

/** Day cell used in the calendar grid */
interface DayCell {
  date: number;
  month: number;
  year: number;
  iso: string;
  today: boolean;
  selected: boolean;
  disabled: boolean;
  outside: boolean;
}

@Component({
  selector: 'app-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, IconComponent],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css',
})
export class DatePickerComponent {
  /* ── Inputs ─────────────────────────────────────────────── */
  readonly label = input('');
  readonly inputId = input.required<string>();
  readonly field = input.required<unknown>();
  readonly placeholder = input('Select date...');
  readonly hint = input('');
  readonly minDate = input('');
  readonly maxDate = input('');
  readonly variant = input<'primary' | 'success' | 'warning' | 'danger'>('primary');

  /* ── Internal state ─────────────────────────────────────── */
  protected readonly isOpen = signal(false);
  protected readonly viewMonth = signal(new Date().getMonth());
  protected readonly viewYear = signal(new Date().getFullYear());

  private readonly platformId = inject(PLATFORM_ID);
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly hiddenInput = viewChild<ElementRef<HTMLInputElement>>('hiddenInput');

  /* ── Derived state ──────────────────────────────────────── */

  /** Current value read from the hidden form field */
  protected readonly selectedValue = computed(() => {
    try {
      const val = (this.field() as any)?.()?.value?.();
      return typeof val === 'string' ? val : '';
    } catch {
      return '';
    }
  });

  /** Formatted display text */
  protected readonly displayText = computed(() => {
    const iso = this.selectedValue();
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  });

  protected readonly monthLabel = computed(() => {
    const d = new Date(this.viewYear(), this.viewMonth(), 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  });

  protected readonly weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  /** Build the 6-row x 7-col day grid for the current view month */
  protected readonly days = computed((): DayCell[] => {
    const m = this.viewMonth();
    const y = this.viewYear();
    const today = new Date();
    const todayIso = this.toIso(today.getFullYear(), today.getMonth(), today.getDate());
    const selected = this.selectedValue();
    const minD = this.minDate();
    const maxD = this.maxDate();

    const firstDay = new Date(y, m, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrev = new Date(y, m, 0).getDate();

    const cells: DayCell[] = [];

    // Previous month fill
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      const pm = m === 0 ? 11 : m - 1;
      const py = m === 0 ? y - 1 : y;
      const iso = this.toIso(py, pm, d);
      cells.push({
        date: d, month: pm, year: py, iso,
        today: iso === todayIso,
        selected: iso === selected,
        disabled: this.isDisabled(iso, minD, maxD),
        outside: true,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = this.toIso(y, m, d);
      cells.push({
        date: d, month: m, year: y, iso,
        today: iso === todayIso,
        selected: iso === selected,
        disabled: this.isDisabled(iso, minD, maxD),
        outside: false,
      });
    }

    // Next month fill to 42 cells (6 rows)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nm = m === 11 ? 0 : m + 1;
      const ny = m === 11 ? y + 1 : y;
      const iso = this.toIso(ny, nm, d);
      cells.push({
        date: d, month: nm, year: ny, iso,
        today: iso === todayIso,
        selected: iso === selected,
        disabled: this.isDisabled(iso, minD, maxD),
        outside: true,
      });
    }

    return cells;
  });

  protected readonly accentClasses = computed(() => {
    switch (this.variant()) {
      case 'success':
        return {
          ring: 'ring-green-500/25',
          border: 'border-green-500',
          bg: 'bg-green-500 text-white',
          hover: 'hover:bg-green-50 dark:hover:bg-green-900/20',
        };
      case 'warning':
        return {
          ring: 'ring-amber-500/25',
          border: 'border-amber-500',
          bg: 'bg-amber-500 text-white',
          hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
        };
      case 'danger':
        return {
          ring: 'ring-red-500/25',
          border: 'border-red-500',
          bg: 'bg-red-500 text-white',
          hover: 'hover:bg-red-50 dark:hover:bg-red-900/20',
        };
      default:
        return {
          ring: 'ring-blue-500/25',
          border: 'border-blue-500',
          bg: 'bg-blue-600 text-white',
          hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
        };
    }
  });

  /* ── Validation state ──────────────────────────────────── */

  protected readonly touched = computed(() => {
    try { return (this.field() as any)?.()?.touched?.() ?? false; } catch { return false; }
  });

  protected readonly invalid = computed(() => {
    try { return (this.field() as any)?.()?.invalid?.() ?? false; } catch { return false; }
  });

  protected readonly errors = computed((): { message: string }[] => {
    try { return ((this.field() as any)?.()?.errors?.() ?? []) as { message: string }[]; } catch { return []; }
  });

  /* ── Actions ────────────────────────────────────────────── */

  protected toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected open(): void {
    // Sync calendar view to currently selected date
    const sel = this.selectedValue();
    if (sel) {
      const parts = sel.split('-');
      if (parts.length === 3) {
        this.viewYear.set(+parts[0]);
        this.viewMonth.set(+parts[1] - 1);
      }
    } else {
      const now = new Date();
      this.viewMonth.set(now.getMonth());
      this.viewYear.set(now.getFullYear());
    }
    this.isOpen.set(true);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected prevMonth(): void {
    if (this.viewMonth() === 0) {
      this.viewMonth.set(11);
      this.viewYear.update((y) => y - 1);
    } else {
      this.viewMonth.update((m) => m - 1);
    }
  }

  protected nextMonth(): void {
    if (this.viewMonth() === 11) {
      this.viewMonth.set(0);
      this.viewYear.update((y) => y + 1);
    } else {
      this.viewMonth.update((m) => m + 1);
    }
  }

  protected goToday(): void {
    const now = new Date();
    this.viewMonth.set(now.getMonth());
    this.viewYear.set(now.getFullYear());
    this.selectDate(this.toIso(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  protected selectDate(iso: string): void {
    // Write the value into the hidden native input + dispatch events
    // so Angular Signal Forms picks up the change
    const el = this.hiddenInput()?.nativeElement;
    if (el) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype, 'value'
      )?.set;
      nativeInputValueSetter?.call(el, iso);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    this.close();
  }

  protected clearDate(): void {
    this.selectDate('');
  }

  protected onClickOutside(): void {
    if (this.isOpen()) this.close();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
      event.preventDefault();
    }
  }

  /* ── Helpers ────────────────────────────────────────────── */

  private toIso(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  private isDisabled(iso: string, minD: string, maxD: string): boolean {
    if (minD && iso < minD) return true;
    if (maxD && iso > maxD) return true;
    return false;
  }

  protected trackDay(_index: number, day: DayCell): string {
    return day.iso;
  }
}
