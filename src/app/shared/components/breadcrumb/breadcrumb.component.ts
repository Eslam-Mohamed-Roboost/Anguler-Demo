// Breadcrumb navigation — auto-generated from route data
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { IconComponent } from '../icon/icon.component';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
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
}
