// Configurable skeleton block — used as building block for other skeleton components
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <div
      class="animate-pulse rounded bg-skeleton"
      [style.width]="width()"
      [style.height]="height()"
    ></div>
  `,
})
export class SkeletonBlockComponent {
  readonly width = input('100%');
  readonly height = input('1rem');
}
