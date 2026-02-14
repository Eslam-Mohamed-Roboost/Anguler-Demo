/**
 * Shared pagination component — client-side or server-side pagination.
 *
 * Usage:
 *   <app-pagination
 *     [currentPage]="currentPage()"
 *     [totalItems]="filteredItems().length"
 *     [pageSize]="pageSize()"
 *     (pageChange)="currentPage.set($event)"
 *   />
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly pageSize = input(10);
  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize())),
  );

  /** Visible page items — numbers with optional ellipsis gaps */
  protected readonly pages = computed<(number | '...')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const items: (number | '...')[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) items.push(i);
      return items;
    }

    // Always show first page
    items.push(1);

    if (current > 3) {
      items.push('...');
    }

    // Pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (current < total - 2) {
      items.push('...');
    }

    // Always show last page
    if (!items.includes(total)) {
      items.push(total);
    }

    return items;
  });

  protected readonly hasPrev = computed(() => this.currentPage() > 1);
  protected readonly hasNext = computed(() => this.currentPage() < this.totalPages());

  /** Range description: "1–10 of 50" */
  protected readonly rangeLabel = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), this.totalItems());
    return `${start}–${end}`;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
