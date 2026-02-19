import { Component, computed, signal } from '@angular/core';
import { BaseComponent } from '../../../../shared/base/base.component';
import { ColumnDef, SortState } from '../../../../shared/components/data-table/column-def';
import { financialHestory } from '../../models/financialHestory-model';
import { PaginationComponent } from "../../../../shared/components/pagination/pagination.component";
import { IconComponent } from "../../../../shared/components/icon/icon.component";
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-financial-history',
  imports: [PaginationComponent, IconComponent,DataTableComponent,SearchInputComponent],
  templateUrl: './financial-history.component.html',
  styleUrl: './financial-history.component.css',
})
export class FinancialHistoryComponent  extends BaseComponent {
   protected readonly columns: ColumnDef[] = [
      { key: 'tripId', header: 'Trip ID', sortable: true },
      { key: 'driver', header: 'Driver', sortable: true },
      { key: 'guestName', header: 'Guest', sortable: true },
      { key: 'roomNo', header: 'Room No.' },
      { key: 'route', header: 'Route' },
      { key: 'duration', header: 'Duration' },
      { key: 'startEndDate', header: 'Start/End Date', sortable: true },
      { key: 'tripProfit', header: 'Trip Profit (2%)', sortable: true },
      { key: 'CommulativeProfit', header: 'Commulative Profit', sortable: true },
      { key: 'actions', header: 'Actions' },
    ];
    protected readonly sortState = signal<SortState>({ column: '', direction: null });
private readonly allTrips: financialHestory[] = Array.from({ length: 100 }, (_, i) => {
     return {
      id: i + 1,
      tripId: `TR00${i + 1}`,
      driver: 'Alice Johnson',
      guestName: 'Alice Johnson',
      roomNo: 'Ro. 24',
      routeFrom: 'Hotel District A',
      routeTo: 'Airport',
      durationMin: 25,
      distanceKm: 12.5,
      tripProfit: 18.50,
      CommulativeProfit: (i + 1) * 3.70,
      startDate: '2024-01-15 14:30',
      endDate: '--',
    };
  });
 protected readonly trips = signal<financialHestory[]>(this.allTrips);
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
          t.guestName.toLowerCase().includes(query),
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
