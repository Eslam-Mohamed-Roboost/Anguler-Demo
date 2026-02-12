// User list — uses DataTable, Search, Pagination, ConfirmDialog, Badge, EmptyState
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseCrudComponent } from '../../../../shared/base/base-crud.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { CellDefDirective } from '../../../../shared/components/data-table/cell-def.directive';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { BtnComponent } from '../../../../shared/components/btn/btn.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TooltipDirective } from '../../../../shared/directives/tooltip.directive';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { UserService } from '../../services/user.service';
import type { ColumnDef } from '../../../../shared/components/data-table/column-def';
import type { User } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DataTableComponent,
    CellDefDirective,
    EmptyStateComponent,
    SearchInputComponent,
    PaginationComponent,
    BtnComponent,
    IconComponent,
    TooltipDirective,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent extends BaseCrudComponent<User> {
  protected readonly service = inject(UserService);
  private readonly notifications = inject(NotificationStore);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly columns: ColumnDef[] = [
    { key: 'id', header: $localize`:@@users.list.colId:ID` },
    { key: 'name', header: $localize`:@@users.list.colName:Name` },
    { key: 'email', header: $localize`:@@users.list.colEmail:Email` },
    { key: 'actions', header: $localize`:@@users.list.colActions:Actions` },
  ];

  // ── Search + pagination ────────────────────────────────────
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  protected readonly filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.items();
    return this.items().filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query),
    );
  });

  protected readonly paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredItems().slice(start, start + this.pageSize());
  });

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  async confirmDelete(user: User): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: $localize`:@@users.list.deleteTitle:Delete User`,
      message: $localize`:@@users.list.deleteMsg:Are you sure you want to delete "${user.name}"?`,
      confirmLabel: $localize`:@@users.list.deleteConfirm:Delete`,
      confirmVariant: 'danger',
    });

    if (confirmed) {
      this.deleteItem(user.id);
      this.notifications.showSuccess(
        $localize`:@@users.list.deleteSuccess:User deleted successfully`,
      );
    }
  }
}
