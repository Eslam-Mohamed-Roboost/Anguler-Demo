// Top navigation bar — breadcrumbs, theme toggle, auth info
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationStore } from '../../../core/stores/notification.store';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, BreadcrumbComponent, TooltipDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationStore);
  readonly menuToggle = output<void>();

  /** Mock login for demo purposes — calls the mock auth endpoint */
  protected mockLogin(): void {
    this.authService.login('admin@demo.com', 'password').subscribe({
      next: () => {
        this.notifications.showSuccess(
          $localize`:@@nav.loginSuccess:Logged in successfully`,
        );
      },
    });
  }
}
