import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-layout-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AdminSidebarComponent, AdminNavbarComponent],
  templateUrl: './layout-admin.component.html',
  styleUrl: './layout-admin.component.css',
})
export class LayoutAdminComponent {
  protected readonly sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
