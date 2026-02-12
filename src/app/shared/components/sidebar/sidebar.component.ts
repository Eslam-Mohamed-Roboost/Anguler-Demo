// Sidebar navigation — responsive with animated mobile overlay and desktop fixed sidebar
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  group,
  query,
} from '@angular/animations';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import type { IconName } from '../icon/icon.component';

export interface SidebarLink {
  path: string;
  label: string;
  icon: IconName;
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
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  animations: [SIDEBAR_ANIMATION],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  readonly open = input(false);
  readonly closed = output<void>();

  readonly links: SidebarLink[] = [
    { path: '/demo', label: $localize`:@@nav.products:Products`, icon: 'package' },
    { path: '/users', label: $localize`:@@nav.users:Users`, icon: 'users' },
    { path: '/showcase', label: $localize`:@@nav.showcase:Showcase`, icon: 'layers' },
  ];
}
