import {
  ChangeDetectionStrategy,
  Component,
  computed,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '../../../../shared/base/base.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { CellDefDirective } from '../../../../shared/components/data-table/cell-def.directive';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { ColumnDef, SortState } from '../../../../shared/components/data-table/column-def';
import { HotelRequestItem } from '../../models/trip-model';
import { RiderHistoryService } from '../../services/rider-history.service';
import { ResultHandlerService } from '../../../../core/services/result-handler.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { inject } from '@angular/core';

@Component({
  selector: 'app-rider-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataTableComponent,
    CellDefDirective,
    PaginationComponent,
    SearchInputComponent,
    BadgeComponent,
    IconComponent,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './rider-history.component.html',
  styleUrl: './rider-history.component.css',
})
export class RiderHistoryComponent extends BaseComponent implements OnInit {
  private readonly riderHistoryService = inject(RiderHistoryService);
  private readonly resultHandler = inject(ResultHandlerService);

  protected readonly columns: ColumnDef[] = [
    { key: 'tripCode', header: 'TripID', sortable: true },
    { key: 'driverName', header: 'Driver', sortable: true },
    { key: 'guestName', header: 'Guest Name', sortable: true },
    { key: 'roomNumber', header: 'Room No.' },
    { key: 'route', header: 'Route' },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'duration', header: 'Duration' },
    { key: 'fare', header: 'Fare', sortable: true },
    { key: 'startEndDate', header: 'Start.End.Date', sortable: true },
    { key: 'actions', header: 'Actions' },
  ];

  protected readonly sortState = signal<SortState>({ column: '', direction: null });
  protected readonly trips = signal<HotelRequestItem[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalItems = signal(0);
  protected readonly loading = signal(false);

  protected readonly filteredTrips = computed(() => {
    const query = this.searchQuery().toLowerCase();
    let result = this.trips();
    if (query) {
      result = result.filter(
        (t) =>
          t.tripCode.toLowerCase().includes(query) ||
          t.driverName.toLowerCase().includes(query) ||
          t.guestName.toLowerCase().includes(query) ||
          t.status.toLowerCase().includes(query),
      );
    }

    const { column, direction } = this.sortState();
    if (column && direction) {
      result = [...result].sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[column];
        const bVal = (b as unknown as Record<string, unknown>)[column];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    return result;
  });

  ngOnInit(): void {
    this.loadTrips();
  }

  protected loadTrips(): void {
    this.loading.set(true);
    this.riderHistoryService
      .getHotelRequestsHistory({
        pageNumber: this.currentPage(),
        pageSize: this.pageSize(),
      })
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (result) => {
          this.resultHandler.handleResult(
            result,
            (data) => {
              this.trips.set(data.items ?? []);
              this.totalItems.set(data.totalCount);
            },
            () => {
              this.trips.set([]);
              this.totalItems.set(0);
            },
          );
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onSort(state: SortState): void {
    this.sortState.set(state);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTrips();
  }

  clearSort(): void {
    this.sortState.set({ column: '', direction: null });
  }

  getStatusVariant(status: string): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
    const normalized = status.toLowerCase();
    if (normalized === 'completed') return 'success';
    if (normalized === 'cancelled') return 'danger';
    if (normalized === 'scheduled') return 'info';
    if (normalized === 'waiting driver' || normalized === 'pending') return 'warning';
    if (normalized === 'active' || normalized === 'in progress') return 'success';
    return 'neutral';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  formatCurrency(amount: number, currency: string): string {
    if (currency) {
      return `${amount.toFixed(2)} ${currency}`;
    }
    return `$ ${amount.toFixed(2)}`;
  }
}
