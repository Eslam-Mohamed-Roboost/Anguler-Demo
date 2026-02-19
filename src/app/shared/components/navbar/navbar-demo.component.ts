import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-navbar-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NavbarComponent],
  templateUrl: './navbar-demo.component.html',
  styleUrl: './navbar-demo.component.css',
})
export class NavbarDemoComponent {
  /** Message count */
  readonly messageCount = signal(3);

  /** Notification count */
  readonly notificationCount = signal(7);

  /** Show nav icons */
  readonly showNavIcons = signal(true);

  /** Handle message click */
  onMessageClick(): void {
    console.log('Messages clicked');
    // Reset message count or open messages panel
    this.messageCount.set(0);
  }

  /** Handle notification click */
  onNotificationClick(): void {
    console.log('Notifications clicked');
    // Reset notification count or open notifications panel
    this.notificationCount.set(0);
  }

  /** Handle menu toggle */
  onMenuToggle(): void {
    console.log('Menu toggled');
  }

  /** Add new message */
  addMessage(): void {
    this.messageCount.set(this.messageCount() + 1);
  }

  /** Add new notification */
  addNotification(): void {
    this.notificationCount.set(this.notificationCount() + 1);
  }

  /** Toggle nav icons visibility */
  toggleNavIcons(): void {
    this.showNavIcons.set(!this.showNavIcons());
  }
}
