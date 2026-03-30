import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import type { IconName } from '../icon/icon.component';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-admin-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, RouterLink],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css',
})
export class AdminNavbarComponent {
  readonly activeTrips = input(15);
  readonly notificationCount = input(3);
  readonly messageCount = input(3);
  readonly callCount = input(3);
  readonly userName = input('Sherif Ahmed');
  readonly userRole = input('Super Admin');

  readonly menuToggle = output<void>();

  protected readonly profileOpen = signal(false);

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly breadcrumbs = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.buildBreadcrumbs(this.activatedRoute)),
      startWith(this.buildBreadcrumbs(this.activatedRoute)),
    ),
    { initialValue: [] as Breadcrumb[] },
  );

  protected readonly pageInfo = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.getPageInfo(this.activatedRoute)),
      startWith(this.getPageInfo(this.activatedRoute)),
    ),
    { initialValue: { title: 'Dashboard', icon: 'dashboard' as IconName } },
  );

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url = '',
    crumbs: Breadcrumb[] = [],
  ): Breadcrumb[] {
    const children = route.children;
    for (const child of children) {
      const snapshot = child.snapshot;
      if (!snapshot) continue;
      const segments = (snapshot.url ?? []).map((s) => s.path).join('/');
      if (segments) {
        url += `/${segments}`;
      }
      const label = snapshot.data?.['breadcrumb'] as string | undefined;
      if (label) {
        crumbs.push({ label, url });
      }
      return this.buildBreadcrumbs(child, url, crumbs);
    }
    return crumbs;
  }

  toggleProfile(): void {
    this.profileOpen.update((v) => !v);
  }

  closeProfile(): void {
    this.profileOpen.set(false);
  }

  logout(): void {
    this.profileOpen.set(false);
    this.router.navigate(['/auth/login']);
  }

  private getPageInfo(route: ActivatedRoute): { title: string; icon: IconName } {
    let deepest = route;
    while (deepest.firstChild) {
      deepest = deepest.firstChild;
    }
    const data = deepest.snapshot?.data;
    const title = (data?.['breadcrumb'] as string) || 'Dashboard';
    const icon = (data?.['icon'] as IconName) || 'dashboard';
    return { title, icon };
  }
}
