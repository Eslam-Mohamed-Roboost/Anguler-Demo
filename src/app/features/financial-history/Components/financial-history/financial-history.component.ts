import { Component, computed, signal } from '@angular/core';
import { BaseComponent } from '../../../../shared/base/base.component';
import { ColumnDef, SortState } from '../../../../shared/components/data-table/column-def';
import { financialHestory, PayoutAlert, FinancialHistoryItem } from '../../models/financialHestory-model';
import { PaginationComponent } from "../../../../shared/components/pagination/pagination.component";
import { IconComponent } from "../../../../shared/components/icon/icon.component";
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-financial-history',
  imports: [PaginationComponent, IconComponent, SearchInputComponent],
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
private readonly allTrips: FinancialHistoryItem[] = Array.from({ length: 100 }, (_, i) => {
    const tripData: financialHestory = {
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
    
    // Insert alerts after certain rows
    if (i === 4) {
      return {
        id: 1000 + i,
        type: 'scheduled',
        amount: 100.00,
        message: `Your payout of $100.00 has been scheduled. You will receive the funds shortly according to our processing timeline.`
      } as PayoutAlert;
    }
    
    if (i === 9) {
      return {
        id: 2000 + i,
        type: 'processed',
        amount: 200.50,
        message: `Your payout of $200.50 has been successfully processed and sent to your account.`
      } as PayoutAlert;
    }
    
    if (i === 14) {
      return {
        id: 3000 + i,
        type: 'scheduled',
        amount: 150.75,
        message: `Your payout of $150.75 has been scheduled. You will receive the funds shortly according to our processing timeline.`
      } as PayoutAlert;
    }
    
    if (i === 19) {
      return {
        id: 4000 + i,
        type: 'processed',
        amount: 325.25,
        message: `Your payout of $325.25 has been successfully processed and sent to your account.`
      } as PayoutAlert;
    }
    
    if (i === 24) {
      return {
        id: 5000 + i,
        type: 'scheduled',
        amount: 89.99,
        message: `Your payout of $89.99 has been scheduled. You will receive the funds shortly according to our processing timeline.`
      } as PayoutAlert;
    }
    
    if (i === 29) {
      return {
        id: 6000 + i,
        type: 'processed',
        amount: 412.80,
        message: `Your payout of $412.80 has been successfully processed and sent to your account.`
      } as PayoutAlert;
    }
    
    return tripData;
  });
 protected readonly trips = signal<FinancialHistoryItem[]>(this.allTrips);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  protected readonly filteredTrips = computed(() => {
    const query = this.searchQuery().toLowerCase();
    let result = this.trips();
    if (query) {
      result = result.filter((item) => {
        // Only filter trip data, not alerts
        if ('tripId' in item) {
          const trip = item as financialHestory;
          return (
            trip.tripId.toLowerCase().includes(query) ||
            trip.driver.toLowerCase().includes(query) ||
            trip.guestName.toLowerCase().includes(query)
          );
        }
        // Always include alerts in search results
        return true;
      });
    }

    const { column, direction } = this.sortState();
    if (column && direction) {
      result = [...result].sort((a, b) => {
        // Only sort trip data, keep alerts in place
        if ('tripId' in a && 'tripId' in b) {
          const tripA = a as financialHestory;
          const tripB = b as financialHestory;
          const aVal = (tripA as unknown as Record<string, unknown>)[column];
          const bVal = (tripB as unknown as Record<string, unknown>)[column];
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
          }
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return direction === 'asc' ? aVal - bVal : bVal - aVal;
          }
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

  // Helper functions to determine item type
  isAlert(item: FinancialHistoryItem): item is PayoutAlert {
    return 'type' in item;
  }

  isTrip(item: FinancialHistoryItem): item is financialHestory {
    return 'tripId' in item;
  }
}
