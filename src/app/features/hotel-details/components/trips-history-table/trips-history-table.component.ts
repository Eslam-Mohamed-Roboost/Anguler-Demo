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
import { HeaderCellDefDirective } from '../../../../shared/components/data-table/header-cell-def.directive';
import type { ColumnDef } from '../../../../shared/components/data-table/column-def';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import type { HotelRecord, TripRecord, TripSearchFilters } from '../../types/hotel-details.types';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { ModalComponent } from "../../../../shared/components/modal/modal.component";
import { HotelDetailsService } from '../../services/hotel-details.service';
import { AppConfigService } from '../../../../core/services/app-config.service';
import { HotelFinancialSortBy, HotelTripSortBy, SortDirection } from '../../models/dto';

interface HotelFinancialSortOption {
  sortBy: HotelFinancialSortBy;
  sortDirection: SortDirection;
  label: string;
}

interface HotelActionMenuState {
  hotel: HotelRecord;
  left: number;
  top: number;
}

@Component({
  selector: 'app-trips-history-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataTableComponent,
    CellDefDirective,
    HeaderCellDefDirective,
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
  readonly sortChange = output<HotelTripSortBy>();
  readonly hotelSortChange = output<{ sortBy: HotelFinancialSortBy; sortDirection: SortDirection }>();

  readonly selectedSort = signal<HotelTripSortBy>(HotelTripSortBy.RequestedAt);
  readonly selectedHotelSortBy = signal<HotelFinancialSortBy>(HotelFinancialSortBy.CreatedDate);
  readonly selectedHotelSortDirection = signal<SortDirection>(SortDirection.Descending);
  readonly showSortDropdown = signal(false);
  readonly showFilterDropdown = signal(false);
  readonly statusFilter = signal('');
  readonly hotelActionMenu = signal<HotelActionMenuState | null>(null);
  readonly selectedHotelIds = signal<Set<string>>(new Set<string>());
  protected readonly searchPlaceholderKey = computed(() =>
    this.activeTab() === 'trips' ? 'hotelDetails.searchTrips' : 'hotelDetails.searchHotels'
  );
  protected readonly selectedHotels = computed(() =>
    this.hotels().filter(hotel => {
      const id = this.hotelSelectionKey(hotel);
      return id.length > 0 && this.selectedHotelIds().has(id);
    }),
  );
  protected readonly selectedHotelsCount = computed(() => this.selectedHotels().length);
  protected readonly hasSelectedHotels = computed(() => this.selectedHotelsCount() > 0);
  protected readonly allHotelsSelected = computed(() => {
    const ids = this.selectableHotelIds();
    return ids.length > 0 && ids.every(id => this.selectedHotelIds().has(id));
  });
  protected readonly someHotelsSelected = computed(() => {
    const ids = this.selectableHotelIds();
    const count = ids.filter(id => this.selectedHotelIds().has(id)).length;
    return count > 0 && count < ids.length;
  });
  protected readonly commissionModalTitleKey = computed(() =>
    this.selectedHotelsCount() > 1
      ? 'hotelDetails.commissionsPlural'
      : 'hotelDetails.commissionSingle',
  );

  private readonly hotelCommissionInfo = inject(HotelDetailsService);
  private readonly appConfig = inject(AppConfigService);
  protected readonly sortOptions = [
    { value: HotelTripSortBy.RequestedAt, label: 'hotelDetails.sortRequestedAt' },
    { value: HotelTripSortBy.FareDesc, label: 'hotelDetails.sortFareDesc' },
    { value: HotelTripSortBy.FareAsc, label: 'hotelDetails.sortFareAsc' },
  ];
  protected readonly hotelSortOptions: HotelFinancialSortOption[] = [
    {
      sortBy: HotelFinancialSortBy.CreatedDate,
      sortDirection: SortDirection.Descending,
      label: 'hotelDetails.sortCreatedDateDesc',
    },
    {
      sortBy: HotelFinancialSortBy.CreatedDate,
      sortDirection: SortDirection.Ascending,
      label: 'hotelDetails.sortCreatedDateAsc',
    },
    {
      sortBy: HotelFinancialSortBy.MonthlyDues,
      sortDirection: SortDirection.Ascending,
      label: 'hotelDetails.sortMonthlyDuesAsc',
    },
    {
      sortBy: HotelFinancialSortBy.MonthlyDues,
      sortDirection: SortDirection.Descending,
      label: 'hotelDetails.sortMonthlyDuesDesc',
    },
  ];

  protected readonly tripColumns = computed<ColumnDef[]>(() => [
    { key: 'tripId', header: 'Trip Code', sortable: false, headerClass: 'w-28' },
    { key: 'hotelName', header: 'Hotel Name', sortable: false, headerClass: 'w-36' },
    { key: 'guestName', header: 'Guest Name', sortable: false, headerClass: 'w-32' },
    { key: 'driverName', header: 'Driver Name', sortable: false, headerClass: 'w-32' },
    { key: 'route', header: 'Route', sortable: false, headerClass: 'w-40' },
    { key: 'requestStatus', header: 'Request Status', sortable: false, headerClass: 'w-36' },
    { key: 'tripStatus', header: 'Trip Status', sortable: false, headerClass: 'w-32' },
    { key: 'fare', header: 'Fare (CHF)', sortable: false, headerClass: 'w-28' },
    { key: 'startEndDate', header: 'Start.End.Date', sortable: false, headerClass: 'w-36' },
    { key: 'actions', header: 'Actions', sortable: false, headerClass: 'w-20' },
  ]);

  protected readonly hotelColumns = computed<ColumnDef[]>(() => [
    { key: 'select', header: '', sortable: false, headerClass: 'w-10', cellClass: 'w-10' },
    { key: 'id', header: 'ID', sortable: false, headerClass: 'w-24' },
    { key: 'hotelName', header: 'Hotel Name', sortable: false, headerClass: 'w-56' },
    { key: 'totalTrips', header: 'Total Trips', sortable: false, headerClass: 'w-24' },
    { key: 'hotelComm', header: 'Hotel Comm.', sortable: false, headerClass: 'w-24' },
    { key: 'hotelProfits', header: 'Hotel Profits', sortable: false, headerClass: 'w-28' },
    { key: 'linesProfits', header: 'Lines profits', sortable: false, headerClass: 'w-28' },
    { key: 'monthlyDues', header: 'Monthly Dues', sortable: false, headerClass: 'w-28' },
    { key: 'status', header: 'Status', sortable: false, headerClass: 'w-36' },
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
  readonly commissionSaving = signal(false);
  readonly singleCommissionHotelId = signal<string | null>(null);

  protected openCommissionModal(): void {
    this.singleCommissionHotelId.set(null);
    this.showCommissionsModal.set(true);
    this.loadCurrentCommission();
  }

  protected openHotelCommissionModal(hotel: HotelRecord): void {
    const id = this.hotelSelectionKey(hotel);
    if (!id) {
      return;
    }

    this.hotelActionMenu.set(null);
    this.singleCommissionHotelId.set(id);
    this.selectedHotelIds.set(new Set([id]));
    this.generalCommissionField.set(this.parseCommissionValue(hotel.hotelComm));
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
    if (this.singleCommissionHotelId()) {
      this.selectedHotelIds.set(new Set<string>());
      this.singleCommissionHotelId.set(null);
    }
  }
  protected setTab(tab: 'trips' | 'hotels'): void {
    this.activeTab.set(tab);
    this.statusFilter.set('');
    this.showFilterDropdown.set(false);
    this.showSortDropdown.set(false);
    this.hotelActionMenu.set(null);
    this.selectedHotelIds.set(new Set<string>());
    this.tabChange.emit(tab);
  }

  protected toggleSortDropdown(): void {
    this.showFilterDropdown.set(false);
    this.hotelActionMenu.set(null);
    this.showSortDropdown.update(show => !show);
  }

  protected onSortOption(sortBy: HotelTripSortBy): void {
    this.selectedSort.set(sortBy);
    this.showSortDropdown.set(false);
    this.sortChange.emit(sortBy);
  }

  protected selectedSortLabel(): string {
    return this.sortOptions.find(option => option.value === this.selectedSort())?.label ?? 'hotelDetails.sort';
  }

  protected onHotelSortOption(option: HotelFinancialSortOption): void {
    this.selectedHotelSortBy.set(option.sortBy);
    this.selectedHotelSortDirection.set(option.sortDirection);
    this.showSortDropdown.set(false);
    this.hotelSortChange.emit({
      sortBy: option.sortBy,
      sortDirection: option.sortDirection,
    });
  }

  protected selectedHotelSortLabel(): string {
    return this.hotelSortOptions.find(option =>
      option.sortBy === this.selectedHotelSortBy() &&
      option.sortDirection === this.selectedHotelSortDirection()
    )?.label ?? 'hotelDetails.sort';
  }

  protected toggleFilterDropdown(): void {
    this.showSortDropdown.set(false);
    this.hotelActionMenu.set(null);
    this.showFilterDropdown.update(show => !show);
  }

  protected onStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.showFilterDropdown.set(false);
    this.filterChange.emit({ status });
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.hotelActionMenu.set(null);
    if (this.activeTab() === 'hotels') {
      this.selectedHotelIds.set(new Set<string>());
    }
    this.searchChange.emit(target.value);
  }

  protected isHotelSelected(hotel: HotelRecord): boolean {
    const id = this.hotelSelectionKey(hotel);
    return id.length > 0 && this.selectedHotelIds().has(id);
  }

  protected toggleHotelSelection(hotel: HotelRecord): void {
    const id = this.hotelSelectionKey(hotel);
    if (!id) {
      return;
    }

    this.selectedHotelIds.update(current => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  protected toggleAllHotelsSelection(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedHotelIds.set(
      target.checked ? new Set(this.selectableHotelIds()) : new Set<string>(),
    );
  }

  protected removeSelectedHotel(hotel: HotelRecord): void {
    const id = this.hotelSelectionKey(hotel);
    if (!id) {
      return;
    }

    this.selectedHotelIds.update(current => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }

  protected onTripAction(trip: TripRecord, action: string): void {
    this.tripAction.emit({ type: action, tripId: trip.id,hotelId:trip.hotelId });
  }

  protected toggleHotelActionMenu(event: MouseEvent, hotel: HotelRecord): void {
    event.stopPropagation();

    const currentMenu = this.hotelActionMenu();
    if (currentMenu?.hotel.id === hotel.id) {
      this.hotelActionMenu.set(null);
      return;
    }

    const trigger = event.currentTarget;
    if (!(trigger instanceof HTMLElement)) {
      return;
    }

    const menuWidth = 194;
    const menuHeight = hotel.settlementStatus === 'in-progress' ? 172 : 132;
    const viewportPadding = 12;
    const rect = trigger.getBoundingClientRect();
    const left = Math.max(
      viewportPadding,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - viewportPadding),
    );
    const preferredTop = rect.bottom + 8;
    const top = preferredTop + menuHeight > window.innerHeight - viewportPadding
      ? Math.max(viewportPadding, rect.top - menuHeight - 8)
      : preferredTop;

    this.hotelActionMenu.set({ hotel, left, top });
  }

  protected onHotelAction(type: 'view' | 'settle' | 'block', hotel: HotelRecord): void {
    this.hotelActionMenu.set(null);
    this.hotelAction.emit({ type, hotel });
  }

  protected hotelSelectionKey(hotel: HotelRecord): string {
    return hotel.id.trim();
  }

  protected onHotelPageChange(page: number): void {
    this.hotelActionMenu.set(null);
    this.selectedHotelIds.set(new Set<string>());
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
    if (statusKey.includes('cancel')) return this.tripStatusColorMap['cancelled'];

    return this.tripStatusColorMap[statusKey] || 'text-status-scheduled bg-status-scheduled-bg';
  }

  protected formatStatus(status: string): string {
    if (!status) return '--';

    if (status.toLowerCase().includes('cancel')) {
      return 'Cancelled';
    }

    return status
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]+/g, ' ')
      .trim();
  }

  protected statusTranslationKey(status: string): string {
    const normalized = this.normalizeStatus(this.formatStatus(status));
    const map: Record<string, string> = {
      pending: 'tripDetails.status.Pending',
      accepted: 'tripDetails.status.Accepted',
      arrived: 'tripDetails.status.Arrived',
      active: 'tripDetails.status.Active',
      'in-progress': 'tripDetails.status.InProgress',
      completed: 'tripDetails.status.Completed',
      scheduled: 'tripDetails.status.Scheduled',
      'not-started': 'tripDetails.status.NotStarted',
      rejected: 'tripDetails.status.Rejected',
      failed: 'tripDetails.status.Failed',
      'waiting-driver': 'tripDetails.status.WaitingDriver',
    };

    if (normalized.includes('cancel')) {
      return 'tripDetails.status.Cancelled';
    }

    return map[normalized] ?? this.formatStatus(status);
  }

  private normalizeStatus(status: string): string {
    return status.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  updateCommissionSettings(): void {
    this.hotelCommissionInfo.updateHotelCommission(this.generalCommissionField(), Array.from(this.selectedHotelIds())).subscribe({
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
    const commission = this.generalCommissionField();
    const targetHotelIds = Array.from(this.selectedHotelIds());

    if (commission < 0 || commission > 100) {
      return;
    }

    this.commissionSaving.set(true);
    this.hotelCommissionInfo
      .updateHotelCommission(commission, targetHotelIds)
      .subscribe({
        next: (result) => {
          this.commissionSaving.set(false);
          if (result.isSuccess) {
            if (targetHotelIds.length === 0) {
              this.appConfig.setCommissionPercentage(commission);
            }
            this.selectedHotelIds.set(new Set<string>());
            this.singleCommissionHotelId.set(null);
            this.closeCommissionModal();
          }
        },
        error: () => {
          this.commissionSaving.set(false);
        },
      });
  }

  private loadCurrentCommission(): void {
    this.commissionLoading.set(true);
    this.hotelCommissionInfo.getGlobalCommission().subscribe({
      next: (result) => {
        this.commissionLoading.set(false);
        if (result.isSuccess && result.data !== null && result.data !== undefined) {
          this.generalCommissionField.set(result.data);
          this.appConfig.setCommissionPercentage(result.data);
        }
      },
      error: () => {
        this.commissionLoading.set(false);
      },
    });
  }

  private parseCommissionValue(value: string): number {
    const parsed = Number.parseFloat(value.replace('%', '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private selectableHotelIds(): string[] {
    return this.hotels()
      .map(hotel => this.hotelSelectionKey(hotel))
      .filter(id => id.length > 0);
  }
}
