import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly illustration = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.getIllustration()),
      startWith(this.getIllustration()),
    ),
    { initialValue: 'login' },
  );

  private getIllustration(): string {
    let deepest = this.route;
    while (deepest.firstChild) {
      deepest = deepest.firstChild;
    }
    return (deepest.snapshot?.data?.['illustration'] as string) || 'login';
  }
}
