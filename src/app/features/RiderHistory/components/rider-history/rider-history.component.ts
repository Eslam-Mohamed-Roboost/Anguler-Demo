import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { BaseComponent } from '../../../../shared/base/base.component';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { CellDefDirective } from '../../../../shared/components/data-table/cell-def.directive';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import type { ColumnDef, SortState } from '../../../../shared/components/data-table/column-def';

export interface Trip {
  id: number;
  tripId: string;
  driver: string;
  guestName: string;
  roomNo: string;
  routeFrom: string;
  routeTo: string;
  status: 'Completed' | 'Cancelled' | 'Scheduled' | 'Waiting Driver' | 'Active';
  durationMin: number;
  distanceKm: number;
  fare: number;
  commission: number;
  startDate: string;
  endDate: string;
}

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
  ],
  templateUrl: './rider-history.component.html',
  styleUrl: './rider-history.component.css',
})
export class RiderHistoryComponent extends BaseComponent {
  protected readonly columns: ColumnDef[] = [
    { key: 'tripId', header: 'Trip ID', sortable: true },
    { key: 'driver', header: 'Driver', sortable: true },
    { key: 'guestName', header: 'Guest Name', sortable: true },
    { key: 'roomNo', header: 'Room No.' },
    { key: 'route', header: 'Route' },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'duration', header: 'Duration' },
    { key: 'fare', header: 'Fare', sortable: true },
    { key: 'startEndDate', header: 'Stat/End Date', sortable: true },
    { key: 'actions', header: 'Actions' },
  ];

  protected readonly sortState = signal<SortState>({ column: '', direction: null });

  private readonly allTrips: Trip[] = Array.from({ length: 100 }, (_, i) => {
    const statuses: Trip['status'][] = ['Completed', 'Cancelled', 'Scheduled', 'Waiting Driver', 'Active'];
    return {
      id: i + 1,
      tripId: 'TR001',
      driver: 'Alice Johnson',
      guestName: 'Alice Johnson',
      roomNo: 'Ro. 24',
      routeFrom: 'Hotel District A',
      routeTo: 'Airport',
      status: statuses[i % statuses.length],
      durationMin: 25,
      distanceKm: 12.5,
      fare: 18.50,
      commission: 3.70,
      startDate: '2024-01-15 14:30',
      endDate: '--',
    };
  });

  protected readonly trips = signal<Trip[]>(this.allTrips);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  protected readonly filteredTrips = computed(() => {
    const query = this.searchQuery().toLowerCase();
    let result = this.trips();
    if (query) {
      result = result.filter(
        (t) =>
          t.tripId.toLowerCase().includes(query) ||
          t.driver.toLowerCase().includes(query) ||
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

  protected readonly paginatedTrips = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredTrips().slice(start, start + this.pageSize());
  });

  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onSort(state: SortState): void {
    this.sortState.set(state);
    this.currentPage.set(1);
  }

  clearSort(): void {
    this.sortState.set({ column: '', direction: null });
  }

  getStatusVariant(status: string): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
    switch (status) {
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      case 'Scheduled': return 'info';
      case 'Waiting Driver': return 'warning';
      case 'Active': return 'success';
      default: return 'neutral';
    }
  }
}
