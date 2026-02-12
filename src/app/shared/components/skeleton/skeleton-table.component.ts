// Skeleton table — configurable rows and columns for list loading states
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SkeletonBlockComponent } from './skeleton-block.component';

@Component({
  selector: 'app-skeleton-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonBlockComponent],
  host: { 'aria-hidden': 'true' },
  template: `
    <div class="w-full space-y-3">
      @for (row of rowArray(); track $index) {
        <div class="flex gap-4">
          @for (col of colArray(); track $index) {
            <app-skeleton-block width="100%" height="1.5rem" />
          }
        </div>
      }
    </div>
  `,
})
export class SkeletonTableComponent {
  readonly rows = input(5);
  readonly columns = input(4);

  protected readonly rowArray = computed(() => Array.from<unknown>({ length: this.rows() }));
  protected readonly colArray = computed(() => Array.from<unknown>({ length: this.columns() }));
}
