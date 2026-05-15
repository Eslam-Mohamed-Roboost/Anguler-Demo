import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CellDefDirective } from '../../../../shared/components/data-table/cell-def.directive';
import type { ColumnDef } from '../../../../shared/components/data-table/column-def';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import type { HotelRecord, TripRecord, TripSearchFilters } from '../../types/hotel-details.types';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ModalComponent } from "../../../../shared/components/modal/modal.component";
import { HotelDetailsService } from '../../services/hotel-details.service';

@Component({
  selector: 'app-trips-history-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataTableComponent,
    CellDefDirective,
    CardComponent,
    IconComponent,
    PaginationComponent,
    TranslatePipe,
    ModalComponent
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
  readonly statusOptions = input<string[]>([]);
  readonly totalTrips = input(0);
  readonly totalHotels = input(0);
 readonly generalCommissionField = signal(0);
  readonly activeTab = signal<'trips' | 'hotels'>('trips');

  readonly currentPage = input(1);
  readonly pageSize = input(10);

  readonly searchChange = output<string>();
  readonly filterChange = output<TripSearchFilters>();
  readonly tabChange = output<'trips' | 'hotels'>();
  readonly tripAction = output<{ type: string; tripId: string; hotelId?: string }>();
  readonly hotelAction = output<{ type: 'view' | 'settle' | 'block'; hotel: HotelRecord }>();
  readonly commissionSettings = output<void>();
  readonly pageChange = output<number>();
  readonly sortChange = output<'asc' | 'desc'>();

  readonly sortOrder = signal<'asc' | 'desc'>('asc');
  readonly showFilterDropdown = signal(false);
  readonly statusFilter = signal('');
  readonly openHotelActionId = signal<string | null>(null);

 private readonly hotelCommissionInfo = inject(HotelDetailsService);
  protected readonly tripColumns = computed<ColumnDef[]>(() => [
    { key: 'tripId', header: 'Trip Code', sortable: true, headerClass: 'w-28' },
    { key: 'hotelName', header: 'Hotel Name', sortable: true, headerClass: 'w-36' },
    { key: 'guestName', header: 'Guest Name', sortable: true, headerClass: 'w-32' },
    { key: 'driverName', header: 'Driver Name', sortable: true, headerClass: 'w-32' },
    { key: 'route', header: 'Route', sortable: false, headerClass: 'w-40' },
    { key: 'requestStatus', header: 'Request Status', sortable: true, headerClass: 'w-36' },
    { key: 'tripStatus', header: 'Trip Status', sortable: true, headerClass: 'w-32' },
    { key: 'fare', header: 'Fare (CHF)', sortable: true, headerClass: 'w-28' },
    { key: 'startEndDate', header: 'Start.End.Date', sortable: true, headerClass: 'w-36' },
    { key: 'actions', header: 'Actions', sortable: false, headerClass: 'w-20' },
  ]);

  protected readonly hotelColumns = computed<ColumnDef[]>(() => [
    { key: 'id', header: 'ID', sortable: true, headerClass: 'w-24' },
    { key: 'hotelName', header: 'Hotel Name', sortable: true, headerClass: 'w-56', cellClass: 'text-start' },
    { key: 'totalTrips', header: 'Total Trips', sortable: true, headerClass: 'w-24' },
    { key: 'hotelComm', header: 'Hotel Comm.', sortable: true, headerClass: 'w-24' },
    { key: 'hotelProfits', header: 'Hotel Profits', sortable: true, headerClass: 'w-28' },
    { key: 'linesProfits', header: 'Lines profits', sortable: true, headerClass: 'w-28' },
    { key: 'monthlyDues', header: 'Monthly Dues', sortable: true, headerClass: 'w-28' },
    { key: 'status', header: 'Status', sortable: true, headerClass: 'w-36' },
    { key: 'actions', header: 'Actions', sortable: false, headerClass: 'w-20' },
  ]);

  protected readonly tripStatusColorMap: Record<string, string> = {
    completed: 'text-status-completed bg-status-completed-bg',
    active: 'text-status-active bg-status-active-bg',
    pending: 'text-status-scheduled bg-status-scheduled-bg',
    scheduled: 'text-status-scheduled bg-status-scheduled-bg',
    cancelled: 'text-status-cancelled bg-status-cancelled-bg',
    'cancelled-by-driver': 'text-status-cancelled bg-status-cancelled-bg',
    'cancelled-by-passenger': 'text-status-cancelled bg-status-cancelled-bg',
    'not-started': 'text-muted bg-gray-100',
  };

  readonly showCommissionsModal = signal(false);
  readonly commissionLoading = signal(false);

  protected openCommissionModal(): void {
    this.showCommissionsModal.set(true);
  }
  onGeneralCommissionChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = parseFloat(target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      this.generalCommissionField.set(value);
    }
  }
  protected saveCommissionSettings(): void {
    this.commissionSettings.emit();
    this.closeCommissionModal();
  }
  protected closeCommissionModal(): void {
    this.showCommissionsModal.set(false);
  }
  protected setTab(tab: 'trips' | 'hotels'): void {
    this.activeTab.set(tab);
    this.statusFilter.set('');
    this.showFilterDropdown.set(false);
    this.tabChange.emit(tab);
  }

  protected toggleSort(): void {
    this.sortOrder.update(order => order === 'asc' ? 'desc' : 'asc');
    this.sortChange.emit(this.sortOrder());
  }

  protected toggleFilterDropdown(): void {
    this.showFilterDropdown.update(show => !show);
  }

  protected onStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.showFilterDropdown.set(false);
    this.filterChange.emit({ status });
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchChange.emit(target.value);
  }

  protected onTripAction(trip: TripRecord, action: string): void {
    this.tripAction.emit({ type: action, tripId: trip.id,hotelId:trip.hotelId });
  }

  protected toggleHotelActionMenu(hotelId: string): void {
    this.openHotelActionId.update(openId => openId === hotelId ? null : hotelId);
  }

  protected onHotelAction(type: 'view' | 'settle' | 'block', hotel: HotelRecord): void {
    this.openHotelActionId.set(null);
    this.hotelAction.emit({ type, hotel });
  }

  protected onHotelPageChange(page: number): void {
    this.pageChange.emit(page);
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

  protected statusColorClass(statusKey: string): string {
    return this.tripStatusColorMap[statusKey] || 'text-status-scheduled bg-status-scheduled-bg';
  }

  protected formatStatus(status: string): string {
    if (!status) return '--';

    return status
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]+/g, ' ')
      .trim();
  }

  updateCommissionSettings(): void {
    this.hotelCommissionInfo.updateHotelCommission(this.generalCommissionField()).subscribe({
      next: (result) => {
        if (result.isSuccess) {
           this.closeCommissionModal();
        }
      },
      error: (err) => {
        console.error('Error updating commission settings:', err);
      }
    });
  }

  protected saveCommission(): void {
    this.commissionLoading.set(true);
    this.hotelCommissionInfo
      .updateHotelCommission(this.generalCommissionField())
      .subscribe({
        next: (result) => {
          this.commissionLoading.set(false);
          if (result.isSuccess) {
            this.closeCommissionModal();
          }
        },
        error: () => {
          this.commissionLoading.set(false);
        },
      });
  }
}
