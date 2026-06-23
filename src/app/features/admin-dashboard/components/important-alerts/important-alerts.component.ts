import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type AlertRole = 'Rider' | 'Driver';

export interface AlertItem {
  name: string;
  role: AlertRole;
  message: string;
  timeAgo: string;
  avatarColor: string;
}

@Component({
  selector: 'app-important-alerts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './important-alerts.component.html',
  styleUrl: './important-alerts.component.css',
})
export class ImportantAlertsComponent {
  readonly alerts = input<AlertItem[]>([]);

  roleBadgeClass(role: AlertRole): string {
    return role === 'Rider'
      ? 'bg-purple-light text-purple'
      : 'bg-success-light text-primary';
  }

  getInitials(name: string): string {
    return name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase();
  }
}
