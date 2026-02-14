// Application layout shell — sidebar + navbar + animated content area
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { NavbarBookingComponent } from '../navbar-booking/navbar-booking.component';
import { JoinUsService } from '../../../features/booking/components/services/join-us.service';

const ROUTE_ANIMATION = trigger('routeAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(8px)' }),
    ], { optional: true }),
    group([
      query(':leave', [
        animate('150ms ease-in', style({ opacity: 0 })),
      ], { optional: true }),
      query(':enter', [
        animate('250ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ], { optional: true }),
    ]),
  ]),
]);

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, NavbarBookingComponent],
  animations: [ROUTE_ANIMATION],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  private readonly joinUsService = inject(JoinUsService);

  /** Type of navbar to display: 'default' or 'booking' */
  readonly navbarStyle = input<'default' | 'booking'>('default');

  protected readonly sidebarOpen = signal(false);

  /** Whether the user is authenticated (for booking navbar) */
  protected readonly isAuthenticated = signal(true);

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  onJoinUsClick(): void {
    this.joinUsService.requestOpen();
  }

  onSignInClick(): void {
    this.joinUsService.requestSignIn();
  }
}
