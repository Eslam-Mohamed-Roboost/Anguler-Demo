// Skeleton form — configurable field count for form loading states
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-skeleton-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonBlockComponent],
  host: { 'aria-hidden': 'true' },
  template: `
    <div class="space-y-4">
      @for (field of fieldArray(); track $index) {
        <div class="space-y-1">
          <app-skeleton-block width="30%" height="0.875rem" />
          <app-skeleton-block width="100%" height="2.5rem" />
        </div>
      }
      <app-skeleton-block width="6rem" height="2.5rem" />
    </div>
  `,
})
export class SkeletonFormComponent {
  readonly fields = input(4);

  protected readonly fieldArray = computed(() => Array.from<unknown>({ length: this.fields() }));
}
