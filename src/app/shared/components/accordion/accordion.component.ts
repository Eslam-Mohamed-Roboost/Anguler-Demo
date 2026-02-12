/**
 * Reusable accordion component — collapsible sections with animated expand/collapse.
 *
 * Supports single-open (only one panel at a time) or multi-open mode.
 *
 * Usage:
 *   <app-accordion [items]="faqItems" />
 *   <app-accordion [items]="sections" mode="multi" variant="bordered" />
 *
 *   readonly faqItems: AccordionItem[] = [
 *     { key: 'q1', title: 'What is Angular?', content: 'A web framework...' },
 *     { key: 'q2', title: 'What is Tailwind?', content: 'A utility-first CSS...' },
 *   ];
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export interface AccordionItem {
  /** Unique key for the item */
  key: string;
  /** Panel header title */
  title: string;
  /** Panel body content (plain text) */
  content: string;
  /** Optional icon name for the header */
  icon?: string;
  /** Whether the panel starts expanded */
  expanded?: boolean;
  /** Whether the panel is disabled */
  disabled?: boolean;
}

@Component({
  selector: 'app-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.css',
})
export class AccordionComponent {
  /** Accordion panel definitions */
  readonly items = input.required<readonly AccordionItem[]>();

  /** Single = only one panel open at a time; Multi = any number */
  readonly mode = input<'single' | 'multi'>('single');

  /** Visual variant */
  readonly variant = input<'default' | 'bordered' | 'separated'>('default');

  /**
   * User overrides — null means "not yet toggled by the user",
   * so we fall back to the initial expanded flags from items().
   */
  private readonly userExpandedKeys = signal<Set<string> | null>(null);

  /** Effective expanded keys: user overrides take priority, otherwise derive from items */
  private readonly expandedKeys = computed(() => {
    const user = this.userExpandedKeys();
    if (user !== null) return user;
    const initial = new Set<string>();
    for (const item of this.items()) {
      if (item.expanded) initial.add(item.key);
    }
    return initial;
  });

  protected readonly containerClasses = computed(() => {
    const v = this.variant();
    if (v === 'separated') return 'space-y-3';
    if (v === 'bordered') return 'divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-gray-700 dark:border-gray-700';
    return 'divide-y divide-gray-200 dark:divide-gray-700';
  });

  protected panelClasses(item: AccordionItem): string {
    const v = this.variant();
    const base = 'overflow-hidden transition-colors';
    if (v === 'separated') {
      return `${base} rounded-xl border border-gray-200 dark:border-gray-700`;
    }
    return base;
  }

  protected isExpanded(key: string): boolean {
    return this.expandedKeys().has(key);
  }

  protected toggle(item: AccordionItem): void {
    if (item.disabled) return;

    const current = new Set(this.expandedKeys());
    if (current.has(item.key)) {
      current.delete(item.key);
    } else {
      if (this.mode() === 'single') {
        current.clear();
      }
      current.add(item.key);
    }
    this.userExpandedKeys.set(current);
  }

  protected headerClasses(item: AccordionItem): string {
    const isOpen = this.isExpanded(item.key);
    const base = 'flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium transition-colors';
    if (item.disabled) {
      return `${base} cursor-not-allowed text-gray-400 dark:text-gray-600`;
    }
    if (isOpen) {
      return `${base} cursor-pointer text-gray-900 bg-gray-50 dark:bg-gray-800/50 dark:text-white`;
    }
    return `${base} cursor-pointer text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/30`;
  }

  protected trackByKey(_index: number, item: AccordionItem): string {
    return item.key;
  }
}
