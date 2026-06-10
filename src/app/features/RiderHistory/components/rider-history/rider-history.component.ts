import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
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
import { TripRequestService } from '../../../booking/components/services/trip-request.service';
import { NotificationStore } from '../../../../core/stores/notification.store';

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
export class RiderHistoryComponent extends BaseComponent {
  private readonly riderHistoryService = inject(RiderHistoryService);
  private readonly resultHandler = inject(ResultHandlerService);
  private readonly tripRequestService = inject(TripRequestService);
  private readonly notifications = inject(NotificationStore);

  protected readonly columns: ColumnDef[] = [
    { key: 'tripCode', header: 'TripID', sortable: true },
    { key: 'driverName', header: 'Driver', sortable: true },
    { key: 'guestName', header: 'Guest Name', sortable: true },
    { key: 'roomNumber', header: 'Room No.' },
    { key: 'route', header: 'Route' },
    { key: 'requestStatus', header: 'Request Status', sortable: true },
    { key: 'tripStatus', header: 'Trip Status', sortable: true },
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
  protected readonly cancelLoading = signal<string | null>(null);
  protected readonly showFilterDropdown = signal(false);
  protected readonly statusFilter = signal('');
  protected readonly statusOptions = signal<string[]>([]);

  protected readonly filteredTrips = computed(() => {
    let result = this.trips();
    const { column, direction } = this.sortState();
    if (column && direction) {
      result = [...result].sort((a, b) => {
        const aVal = this.getSortValue(a, column);
        const bVal = this.getSortValue(b, column);
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

  constructor() {
    super();
    this.loadStatusOptions();

    effect(() => {
      this.currentPage(); // track — re-run loadTrips on page/search change
      this.searchQuery();
      this.statusFilter();
      this.loadTrips();
    });
  }

  protected loadTrips(): void {
    this.loading.set(true);
    this.riderHistoryService
      .getHotelRequestsHistory({
        pageNumber: this.currentPage(),
        pageSize: this.pageSize(),
        search: this.searchQuery() || undefined,
        status: this.statusFilter() || undefined,
      })
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (result) => {
          if(result.isSuccess == true){
              this.trips.set(result.data?.items ?? []);
              this.totalItems.set(result.data?.totalCount ?? 0);
          }
          
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onSort(state: SortState): void {
    this.sortState.set(state);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  toggleFilterDropdown(): void {
    this.showFilterDropdown.update(show => !show);
  }

  onStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.showFilterDropdown.set(false);
    this.currentPage.set(1);
  }

  clearSort(): void {
    this.sortState.set({ column: '', direction: null });
  }

  isCancellable(row: HotelRequestItem): boolean {
    const s = this.requestStatus(row).toLowerCase();
    return s === 'pending' || s === 'accepted';
  }

  cancelTrip(tripRequestId: string): void {
    this.cancelLoading.set(tripRequestId);
    this.tripRequestService
      .cancelTrip(tripRequestId, 'Cancelled by hotel')
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.cancelLoading.set(null);
          this.notifications.showSuccess('Trip cancelled successfully.');
          this.loadTrips();
        },
        error: () => {
          this.cancelLoading.set(null);
          this.notifications.showError('Failed to cancel trip. Please try again.');
        },
      });
  }

  getStatusVariant(status: string): 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'scheduled' {
    const normalized = status.toLowerCase();
    if (normalized === 'completed') return 'success';
    if (normalized === 'cancelled') return 'danger';
    if (normalized === 'scheduled' || normalized === 'schedualed') return 'scheduled';
    if (normalized === 'waiting driver' || normalized === 'pending') return 'warning';
    if (normalized === 'active' || normalized === 'in progress' || normalized === 'accepted') return 'success';
    return 'neutral';
  }

  requestStatus(row: HotelRequestItem): string {
    return row.tripRequestStatusString || row.requestStatusString || row.status || '--';
  }

  tripStatus(row: HotelRequestItem): string {
    if (this.isScheduledBeforeStart(row)) {
      return 'Scheduled';
    }

    return row.tripStatusString || row.status || 'Not Started';
  }

  startDate(row: HotelRequestItem): string {
    return row.scheduledAt ?? row.startedAt ?? row.requestedAt;
  }

  formatStatus(status: string): string {
    if (!status) return '--';

    return status
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]+/g, ' ')
      .trim();
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

  formatCurrency(amount: number | null | undefined, currency: string): string {
    if (amount == null) return '--';
    if (currency) {
      return `${amount.toFixed(2)} ${currency}`;
    }
    return `$ ${amount.toFixed(2)}`;
  }

  private loadStatusOptions(): void {
    this.riderHistoryService
      .getTripRequestStatuses()
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.statusOptions.set(result.data.status.map(status => status.name));
          } else {
            this.statusOptions.set([]);
          }
        },
        error: () => this.statusOptions.set([]),
      });
  }

  private getSortValue(row: HotelRequestItem, column: string): unknown {
    if (column === 'requestStatus') {
      return this.requestStatus(row);
    }

    if (column === 'tripStatus') {
      return this.tripStatus(row);
    }

    return (row as unknown as Record<string, unknown>)[column];
  }

  private isScheduledBeforeStart(row: HotelRequestItem): boolean {
    if (!row.isScheduled || row.startedAt) return false;

    const status = (row.tripStatusString || row.status || '').toLowerCase();
    return !status.includes('complete') && !status.includes('cancel') && status !== 'rejected';
  }
}
