import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CellDefDirective } from '../../../../shared/components/data-table/cell-def.directive';
import type { ColumnDef } from '../../../../shared/components/data-table/column-def';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import type { HotelRecord, TripRecord, TripSearchFilters } from '../../types/hotel-details.types';

@Component({
  selector: 'app-trips-history-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DataTableComponent,
    CellDefDirective,
    CardComponent,
    IconComponent,
    InputComponent,
  ],
  templateUrl: './trips-history-table.component.html',
  styleUrl: './trips-history-table.component.css',
})
export class TripsHistoryTableComponent {
  readonly trips = input<TripRecord[]>([]);
  readonly hotels = input<HotelRecord[]>([]);
  readonly loading = input(false);
  readonly searchQuery = input('');
  readonly filters = input<TripSearchFilters>({});
  readonly totalTrips = input(0);
  readonly totalHotels = input(0);

  readonly activeTab = signal<'trips' | 'hotels'>('trips');

  readonly searchChange = output<string>();
  readonly filterChange = output<TripSearchFilters>();
  readonly tripAction = output<{ type: string; tripId: string }>();
  readonly commissionSettings = output<void>();

  protected readonly searchField = computed(() => ({
    value: this.searchQuery(),
  }));

  protected readonly tripColumns = computed<ColumnDef[]>(() => [
    { key: 'id', header: 'Trip ID', sortable: true, headerClass: 'w-20' },
    { key: 'hotelName', header: 'Hotel Name', sortable: true, headerClass: 'w-36' },
    { key: 'guestName', header: 'Guest Name', sortable: true, headerClass: 'w-32' },
    { key: 'driverName', header: 'Driver Name', sortable: true, headerClass: 'w-32' },
    { key: 'route', header: 'Route', sortable: false, headerClass: 'w-40' },
    { key: 'status', header: 'Status', sortable: true, headerClass: 'w-28' },
    { key: 'fare', header: 'Fare (CHF)', sortable: true, headerClass: 'w-28' },
    { key: 'startEndDate', header: 'Stat/End Date', sortable: true, headerClass: 'w-36' },
    { key: 'actions', header: 'Actions', sortable: false, headerClass: 'w-20' },
  ]);

  protected readonly hotelColumns = computed<ColumnDef[]>(() => [
    { key: 'select', header: '', sortable: false, headerClass: 'w-10' },
    { key: 'id', header: 'ID', sortable: true, headerClass: 'w-20' },
    { key: 'hotelName', header: 'Hotel Name', sortable: true, headerClass: 'w-44' },
    { key: 'totalTrips', header: 'Total Trips', sortable: true, headerClass: 'w-24' },
    { key: 'hotelComm', header: 'Hotel Comm.', sortable: true, headerClass: 'w-24' },
    { key: 'hotelProfits', header: 'Hotel Profits', sortable: true, headerClass: 'w-28' },
    { key: 'linesProfits', header: 'Lines profits', sortable: true, headerClass: 'w-28' },
    { key: 'monthlyDues', header: 'Monthly Dues', sortable: true, headerClass: 'w-28' },
    { key: 'status', header: 'Status', sortable: true, headerClass: 'w-36' },
    { key: 'actions', header: 'Actions', sortable: false, headerClass: 'w-20' },
  ]);

  protected readonly tripStatusColorMap: Record<string, string> = {
    completed: 'status-completed',
    active: 'status-active',
    pending: 'status-pending',
    scheduled: 'status-scheduled',
    cancelled: 'status-cancelled',
  };

  protected setTab(tab: 'trips' | 'hotels'): void {
    this.activeTab.set(tab);
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchChange.emit(target.value);
  }

  protected onTripAction(trip: TripRecord, action: string): void {
    this.tripAction.emit({ type: action, tripId: trip.id });
  }

  protected formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '--';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(dateStr));
  }
}
