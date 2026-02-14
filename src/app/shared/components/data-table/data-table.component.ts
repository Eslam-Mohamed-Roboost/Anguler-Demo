/**
 * Shared reusable data table — renders tabular data with optional custom cell
 * templates and column sorting.
 *
 * Usage:
 *   <app-data-table
 *     [data]="items()"
 *     [columns]="columns"
 *     trackByKey="id"
 *     [loading]="isLoading()"
 *     [skeletonRows]="5"
 *     ariaLabel="Products table"
 *     (sortChange)="onSort($event)"
 *   >
 *     <ng-template cellDef="price" let-row>
 *       {{ row.price | currency }}
 *     </ng-template>
 *     <ng-template cellDef="actions" let-row>
 *       <a [routerLink]="[row.id, 'edit']">Edit</a>
 *     </ng-template>
 *   </app-data-table>
 *
 * Sorting:
 *   Set `sortable: true` on a ColumnDef to enable sorting for that column.
 *   The table emits `(sortChange)` with the SortState when a sortable header is clicked.
 *   The parent component is responsible for sorting the data (client-side or server-side).
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SkeletonTableComponent } from '../skeleton/skeleton-table.component';
import { IconComponent } from '../icon/icon.component';
import { CellDefDirective } from './cell-def.directive';
// Re-export CellDefDirective so consumers don't need a separate import
export { CellDefDirective } from './cell-def.directive';
import type { ColumnDef, SortState, SortDirection } from './column-def';

@Component({
  selector: 'app-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, SkeletonTableComponent, IconComponent],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
})
export class DataTableComponent {
  /** Array of row data */
  readonly data = input<unknown[]>([]);

  /** Column definitions */
  readonly columns = input.required<ColumnDef[]>();

  /** Property name used for @for track */
  readonly trackByKey = input('id');

  /** Whether to show skeleton loading */
  readonly loading = input(false);

  /** Number of skeleton rows to display while loading */
  readonly skeletonRows = input(5);

  /** Accessible label for the table */
  readonly ariaLabel = input('');

  /** Emitted when a sortable column header is clicked */
  readonly sortChange = output<SortState>();

  /** Current sort state */
  protected readonly sortState = signal<SortState>({ column: '', direction: null });

  /** Collect custom cell templates */
  private readonly cellDefs = contentChildren(CellDefDirective);

  /** Map from column key to template ref */
  protected readonly templateMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const def of this.cellDefs()) {
      map.set(def.cellDef(), def.templateRef);
    }
    return map;
  });

  /** Helper to access row property by key */
  protected getCellValue(row: unknown, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  /** Helper for template track */
  protected trackByFn(row: unknown): unknown {
    return (row as Record<string, unknown>)[this.trackByKey()];
  }

  /** Toggle sort on a column */
  protected toggleSort(col: ColumnDef): void {
    if (!col.sortable) return;

    const current = this.sortState();
    let direction: SortDirection;

    if (current.column === col.key) {
      // Cycle: asc → desc → null
      if (current.direction === 'asc') direction = 'desc';
      else if (current.direction === 'desc') direction = null;
      else direction = 'asc';
    } else {
      direction = 'asc';
    }

    const newState: SortState = { column: direction ? col.key : '', direction };
    this.sortState.set(newState);
    this.sortChange.emit(newState);
  }

  /** Get the sort direction for a column */
  protected getSortDirection(key: string): SortDirection {
    const state = this.sortState();
    return state.column === key ? state.direction : null;
  }

  /** CSS classes for sortable header */
  protected headerClasses(col: ColumnDef): string {
    const base = 'px-3 py-3';
    const sortable = col.sortable ? 'cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-800/50' : '';
    const extra = col.headerClass ?? '';
    return [base, sortable, extra].filter(Boolean).join(' ');
  }
}
