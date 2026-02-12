/**
 * Product list — demonstrates:
 *   - BaseCrudComponent (inherited items, loading, delete)
 *   - DataTableComponent with custom cell templates
 *   - BadgeComponent for status display
 *   - EmptyStateComponent when no items
 *   - SearchInputComponent with debounced filtering
 *   - PaginationComponent for client-side paging
 *   - ConfirmDialogService for delete confirmation
 *   - NotificationStore for success toasts
 *   - @defer with ProductStatsComponent
 *   - ICU plural for item count
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { BaseCrudComponent } from '../../../../shared/base/base-crud.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { CellDefDirective } from '../../../../shared/components/data-table/cell-def.directive';
import { SkeletonBlockComponent } from '../../../../shared/components/skeleton/skeleton-block.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BtnComponent } from '../../../../shared/components/btn/btn.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TooltipDirective } from '../../../../shared/directives/tooltip.directive';
import { ProductStatsComponent } from '../product-stats/product-stats.component';
import { ProductService } from '../../services/product.service';
import { ApiService } from '../../../../core/services/api.service';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import type { ColumnDef } from '../../../../shared/components/data-table/column-def';
import type { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CurrencyPipe,
    DataTableComponent,
    CellDefDirective,
    SkeletonBlockComponent,
    BadgeComponent,
    EmptyStateComponent,
    SearchInputComponent,
    PaginationComponent,
    BtnComponent,
    IconComponent,
    TooltipDirective,
    ProductStatsComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent extends BaseCrudComponent<Product> {
  protected readonly service = inject(ProductService);
  private readonly api = inject(ApiService);
  private readonly notifications = inject(NotificationStore);
  private readonly confirmDialog = inject(ConfirmDialogService);

  // ── Table columns ──────────────────────────────────────────
  protected readonly columns: ColumnDef[] = [
    { key: 'id', header: $localize`:@@demo.list.colId:ID` },
    { key: 'name', header: $localize`:@@demo.list.colName:Name` },
    { key: 'sku', header: $localize`:@@demo.list.colSku:SKU`, cellClass: 'font-mono text-xs' },
    { key: 'price', header: $localize`:@@demo.list.colPrice:Price` },
    { key: 'quantity', header: $localize`:@@demo.list.colQty:Qty` },
    { key: 'isActive', header: $localize`:@@demo.list.colActive:Active` },
    { key: 'actions', header: $localize`:@@demo.list.colActions:Actions` },
  ];

  // ── Search + pagination ────────────────────────────────────
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(5);

  protected readonly filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.items();
    return this.items().filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query),
    );
  });

  protected readonly paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredItems().slice(start, start + this.pageSize());
  });

  protected readonly itemCount = computed(() => this.filteredItems().length);

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  // ── Delete with ConfirmDialogService ───────────────────────
  async confirmDelete(product: Product): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: $localize`:@@demo.list.deleteTitle:Delete Product`,
      message: $localize`:@@demo.list.deleteMsg:Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      confirmLabel: $localize`:@@demo.list.deleteConfirm:Delete`,
      confirmVariant: 'danger',
    });

    if (confirmed) {
      this.deleteItem(product.id);
      this.notifications.showSuccess(
        $localize`:@@demo.list.deleteSuccess:Product deleted successfully`,
      );
    }
  }

  // ── Error simulation (toast demo) ──────────────────────────
  simulateError(): void {
    this.api
      .get('/error-test')
      .pipe(this.takeUntilDestroyed())
      .subscribe();
  }
}
