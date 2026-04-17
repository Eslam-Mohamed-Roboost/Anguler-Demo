import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { CellDefDirective } from '../../../../shared/components/data-table/cell-def.directive';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { ColumnDef } from '../../../../shared/components/data-table/column-def';
import type { HotelRequestItem } from '../../../RiderHistory/models/trip-model';
import { HotelRequestsService, type DriverItem } from '../../services/hotel-requests.service';
import { BaseComponent } from '../../../../shared/base/base.component';

@Component({
  selector: 'app-pending-requests',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataTableComponent,
    CellDefDirective,
    PaginationComponent,
    IconComponent,
    RouterLink,
  ],
  templateUrl: './pending-requests.component.html',
  styleUrl: './pending-requests.component.css',
})
export class PendingRequestsComponent extends BaseComponent implements OnInit {
  private readonly service = inject(HotelRequestsService);

  protected readonly columns: ColumnDef[] = [
    { key: 'tripCode', header: 'Trip ID', sortable: true },
    { key: 'guestName', header: 'Guest', sortable: true },
    { key: 'roomNumber', header: 'Room' },
    { key: 'route', header: 'Route' },
    { key: 'requestedAt', header: 'Requested At', sortable: true },
    { key: 'actions', header: 'Actions' },
  ];

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly assignDriverId = signal<Record<string, string>>({});
  protected readonly assignLoading = signal<string | null>(null);
  protected readonly assignError = signal<string | null>(null);

  protected readonly items = signal<HotelRequestItem[]>([]);
  protected readonly totalItems = signal(0);
  protected readonly loading = signal(false);
  protected readonly drivers = signal<DriverItem[]>([]);
  protected readonly driversLoading = signal(false);

  ngOnInit(): void {
    this.loadDrivers();
    this.loadRequests();
  }

  private loadDrivers(): void {
    this.driversLoading.set(true);
    this.service.getDrivers(1, 100).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.drivers.set(result.data.items);
        }
        this.driversLoading.set(false);
      },
      error: () => this.driversLoading.set(false),
    });
  }

  private loadRequests(): void {
    this.loading.set(true);
    this.service.getPendingRequests(this.currentPage(), this.pageSize()).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.items.set(result.data.items);
          this.totalItems.set(result.data.totalCount);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setDriverId(tripRequestId: string, value: string): void {
    this.assignDriverId.update((m) => ({ ...m, [tripRequestId]: value }));
  }

  assignDriver(tripRequestId: string): void {
    const driverId = this.assignDriverId()[tripRequestId]?.trim();
    if (!driverId) return;

    this.assignLoading.set(tripRequestId);
    this.assignError.set(null);
    this.service.assignDriver(tripRequestId, driverId).subscribe({
      next: () => {
        this.assignLoading.set(null);
        this.loadRequests();
      },
      error: () => {
        this.assignLoading.set(null);
        this.assignError.set(tripRequestId);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadRequests();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '--';
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  }
}
