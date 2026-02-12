/**
 * Reusable tabbed interface with animated indicator.
 *
 * Usage:
 *   <app-tabs
 *     [tabs]="[
 *       { key: 'general', label: 'General' },
 *       { key: 'settings', label: 'Settings' },
 *       { key: 'logs', label: 'Activity Logs' }
 *     ]"
 *     [(activeTab)]="selectedTab"
 *   />
 *
 *   @switch (selectedTab()) {
 *     @case ('general') { <p>General content</p> }
 *     @case ('settings') { <p>Settings content</p> }
 *     @case ('logs') { <p>Logs content</p> }
 *   }
 */
import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import type { IconName } from '../icon/icon.component';

export interface TabDef {
  key: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
}

@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
})
export class TabsComponent {
  /** Tab definitions */
  readonly tabs = input.required<readonly TabDef[]>();

  /** Currently active tab key — two-way binding via model() */
  readonly activeTab = model<string>('');

  /** Visual variant */
  readonly variant = input<'underline' | 'pills'>('underline');

  protected selectTab(tab: TabDef): void {
    if (tab.disabled) return;
    this.activeTab.set(tab.key);
  }

  protected tabClasses(tab: TabDef): string {
    const isActive = this.activeTab() === tab.key;
    const base = 'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors focus:outline-none';

    if (tab.disabled) {
      return `${base} cursor-not-allowed opacity-40`;
    }

    if (this.variant() === 'pills') {
      return isActive
        ? `${base} rounded-lg bg-blue-600 text-white`
        : `${base} rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700`;
    }

    // underline variant
    return isActive
      ? `${base} border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400`
      : `${base} border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200`;
  }
}
