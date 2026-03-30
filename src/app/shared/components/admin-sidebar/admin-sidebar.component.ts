import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  group,
  query,
} from '@angular/animations';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import type { IconName } from '../icon/icon.component';

export interface AdminSidebarLink {
  path: string;
  label: string;
  icon: IconName;
  children?: { path: string; label: string }[];
}

const SIDEBAR_ANIMATION = trigger('sidebarAnimation', [
  transition(':enter', [
    group([
      query('.sidebar-backdrop', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      query('.sidebar-panel', [
        style({ transform: 'translateX(-100%)' }),
        animate('250ms cubic-bezier(0, 0, 0.2, 1)', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ]),
  transition(':leave', [
    group([
      query('.sidebar-backdrop', [
        animate('200ms ease-in', style({ opacity: 0 })),
      ]),
      query('.sidebar-panel', [
        animate('200ms cubic-bezier(0.4, 0, 1, 1)', style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ]),
]);

@Component({
  selector: 'app-admin-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, IconComponent],
  animations: [SIDEBAR_ANIMATION],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
})
export class AdminSidebarComponent {
  readonly open = input(false);
  readonly closed = output<void>();

  protected readonly expandedMenus = signal<Set<string>>(new Set());

  readonly mainLinks: AdminSidebarLink[] = [
    { path: '/home', label: 'Dashboard', icon: 'dashboard' },
    { path: '/passengers', label: 'Passengers', icon: 'users' },
    { path: '/drivers', label: 'Drivers', icon: 'car' },
    { path: '/trips', label: 'Trips', icon: 'map-pin' },
    { path: '/financial-management', label: 'Financial Management', icon: 'dollar-sign' },
    {
      path: '/rewards',
      label: 'Rewards & Referrals',
      icon: 'gift',
      children: [
        { path: '/rewards/programs', label: 'Programs' },
        { path: '/rewards/referrals', label: 'Referrals' },
      ],
    },
    { path: '/reports', label: 'Reports & Analytics', icon: 'bar-chart' },
    { path: '/hotel-integration', label: 'Hotel Integration', icon: 'building' },
    { path: '/communications', label: 'Users Communications', icon: 'chat-bubble' },
    {
      path: '/system',
      label: 'System Management',
      icon: 'settings',
      children: [
        { path: '/system/settings', label: 'Settings' },
        { path: '/system/roles', label: 'Roles' },
      ],
    },
  ];

  readonly bottomLinks: AdminSidebarLink[] = [
    {
      path: '/support',
      label: 'Support Management',
      icon: 'headphones',
      children: [
        { path: '/support/tickets', label: 'Tickets' },
        { path: '/support/faq', label: 'FAQ' },
      ],
    },
  ];

  toggleMenu(path: string): void {
    this.expandedMenus.update((set) => {
      const next = new Set(set);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  isExpanded(path: string): boolean {
    return this.expandedMenus().has(path);
  }
}
