import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  OnInit,
  OnDestroy,
  Renderer2,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap, timer } from 'rxjs';
import type { HotelRecord, TripRecord } from '../../types/hotel-details.types';
import { StatisticsCardComponent, StatisticItem } from '../../components/statistics-card/statistics-card.component';
import { TripsHistoryTableComponent } from '../../components/trips-history-table/trips-history-table.component';
import { HotelDetailsService } from '../../services/hotel-details.service';
import { HotelFinancialsItem, HotelTripItem, DashboardStatsResponse, HotelFinancialSortBy, HotelTripSortBy, SortDirection } from '../../models/dto';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { LanguageService } from '../../../../core/services/language.service';

const DASHBOARD_STATS_REFRESH_MS = 30_000;
const TABLES_REFRESH_MS = 30_000;
const SEARCH_DEBOUNCE_MS = 500;

@Component({
  selector: 'app-hotel-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StatisticsCardComponent,
    TripsHistoryTableComponent,
    IconComponent,
    TranslatePipe,
  ],
  templateUrl: './hotel-dashboard.component.html',
  styleUrl: './hotel-dashboard.component.css',
})
export class HotelDashboardComponent implements OnInit, OnDestroy {
  private readonly hotelDetailsService = inject(HotelDetailsService);
  private readonly renderer = inject(Renderer2);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notifications = inject(NotificationStore);
  private readonly languageService = inject(LanguageService);
  private readonly searchRequests = new Subject<string>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hotelId = signal<string>('');
  private dataLoaded = false;

  readonly statistics = signal<StatisticItem[]>(this.buildStatistics());

  readonly trips = signal<TripRecord[]>([]);
  readonly hotels = signal<HotelRecord[]>([]);
  readonly totalTrips = signal(0);
  readonly totalHotels = signal(0);
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly tripSortBy = signal<HotelTripSortBy>(HotelTripSortBy.RequestedAt);
  readonly hotelSortBy = signal<HotelFinancialSortBy>(HotelFinancialSortBy.CreatedDate);
  readonly hotelSortDirection = signal<SortDirection>(SortDirection.Descending);
  readonly statusFilter = signal('');
  readonly activeTab = signal<'trips' | 'hotels'>('trips');
  readonly statusOptions = signal<string[]>([]);

  readonly filteredTrips = computed(() => this.trips());

  ngOnInit(): void {
    if (this.dataLoaded) return;
    this.dataLoaded = true;
    this.renderer.addClass(document.body, 'hotel-details-active');
    this.loadProfile();
    this.loadStatusOptions('trips');
    this.loadTrips();
    this.loadHotels();
    this.startDashboardStatsRefresh();
    this.startTablesRefresh();
    this.listenForSearchRequests();
  }

  private listenForSearchRequests(): void {
    this.searchRequests
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((query) => {
        if (this.activeTab() === 'trips') {
          this.loadTrips(query || undefined, true, true);
        } else {
          this.loadHotels(query || undefined, true, true);
        }
      });
  }

  private startTablesRefresh(): void {
    timer(TABLES_REFRESH_MS, TABLES_REFRESH_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.activeTab() === 'trips') {
          this.loadTrips(this.searchQuery() || undefined, false, true);
        } else {
          this.loadHotels(this.searchQuery() || undefined, false, true);
        }
      });
  }

  private loadProfile(): void {
    this.hotelDetailsService
      .getMyProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.hotelId.set(result.data.hotelId);
          }
        },
      });
  }

  private startDashboardStatsRefresh(): void {
    timer(0, DASHBOARD_STATS_REFRESH_MS)
      .pipe(
        switchMap(() => {
          const { fromDate, toDate } = this.getDashboardDateRange();
          return this.hotelDetailsService.getDashboardStats(fromDate, toDate, true);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.statistics.set(this.buildStatistics(result.data));
          }
        },
      });
  }

  private loadDashboardStats(): void {
    const { fromDate, toDate } = this.getDashboardDateRange();

    this.hotelDetailsService
      .getDashboardStats(fromDate, toDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.statistics.set(this.buildStatistics(result.data));
          }
        },
      });
  }

  private getDashboardDateRange(): { fromDate: string; toDate: string } {
    const now = new Date();
    const yearAgo = new Date(now);
    yearAgo.setFullYear(now.getFullYear() - 1);

    return {
      fromDate: this.formatDateParam(yearAgo),
      toDate: this.formatDateParam(now),
    };
  }

  private buildStatistics(stats?: DashboardStatsResponse): StatisticItem[] {
    const currency = (n: number) => `${n.toLocaleString()} ${this.languageService.translate('currency.chf')}`;
    const count = (n: number) => String(n);
    return [
      { label: 'stats.totalHotels', value: count(stats?.totalHotels ?? 0), color: 'orange' },
      { label: 'stats.totalRevenue', value: currency(stats?.totalRevenue ?? 0), color: 'orange' },
      { label: 'stats.hotelsCommission', value: currency(stats?.hotelsCommission ?? 0), color: 'orange' },
      { label: 'stats.linesNetProfit', value: currency(stats?.linesNetProfit ?? 0), color: 'orange' },
      { label: 'stats.activeTrips', value: count(stats?.activeTrips ?? 0), color: 'orange' },
      { label: 'stats.scheduledTrips', value: count(stats?.scheduledTrips ?? 0), color: 'orange' },
      { label: 'stats.completedTrips', value: count(stats?.completedTrips ?? 0), color: 'orange' },
      { label: 'stats.canceledTrips', value: count(stats?.canceledTrips ?? 0), color: 'orange' },
    ];
  }

  private formatDateParam(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}-${dd}-${d.getFullYear()}`;
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'hotel-details-active');
  }

  private loadTrips(search?: string, showLoading = true, skipGlobalLoading = false): void {
    if (showLoading) this.loading.set(true);
    this.error.set(null);

    this.hotelDetailsService
      .getHotelTrips(
        this.currentPage(),
        this.pageSize(),
        this.tripSortBy(),
        this.statusFilter() || undefined,
        search,
        skipGlobalLoading,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (showLoading) this.loading.set(false);
          if (result.isSuccess && result.data) {
            this.trips.set(result.data.items.map(item => this.toTripRecord(item, result.data?.hotelId)));
            this.totalTrips.set(result.data.totalCount);
          } else {
            this.error.set(result.error?.description ?? 'Failed to load trips data');
          }
        },
        error: () => {
          if (showLoading) this.loading.set(false);
          this.error.set('Failed to load trips data');
        },
      });
  }

  private loadHotels(search?: string, showLoading = true, skipGlobalLoading = false): void {
    if (showLoading) this.loading.set(true);

    this.hotelDetailsService
      .getAllHotels(
        this.currentPage(),
        this.pageSize(),
        this.hotelSortBy(),
        this.hotelSortDirection(),
        this.statusFilter() || undefined,
        search,
        skipGlobalLoading,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (showLoading) this.loading.set(false);
          if (result.isSuccess && result.data) {
            this.hotels.set(result.data.items.map(item => this.toHotelRecord(item)));
            this.totalHotels.set(result.data.totalCount);
          }
        },
        error: () => {
          if (showLoading) this.loading.set(false);
        },
      });
  }

  private loadStatusOptions(tab: 'trips' | 'hotels'): void {
    const statuses$ = tab === 'trips'
      ? this.hotelDetailsService.getTripRequestStatuses()
      : this.hotelDetailsService.getPayoutAllStatuses();

    statuses$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.statusOptions.set(this.statusNames(result.data));
          } else {
            this.statusOptions.set([]);
          }
        },
        error: () => this.statusOptions.set([]),
      });
  }

  private toHotelRecord(item: HotelFinancialsItem): HotelRecord {
    const code = item.hotelCode?.trim() || item.code?.trim() || '--';
    const settlementStatus = this.toSettlementStatus(item);

    return {
      id: item.hotelId,
      code,
      displayId: code,
      hotelName: item.hotelName,
      hotelStatus: item.isActive ? 'active' : 'suspended',
      totalTrips: item.totalTrips,
      hotelComm: this.formatCommissionRate(item.commissionRate),
      hotelProfits: item.hotelProfits.toFixed(2),
      linesProfits: item.linesProfits.toFixed(2),
      monthlyDues: item.monthlyDues.toFixed(2),
      settlementStatus,
      settlementAmount: item.totalFare.toFixed(2),
      hotelPhone: item.hotelPhone,
    };
  }

  private statusNames(data: unknown): string[] {
    const statusCandidate = data && typeof data === 'object' && 'status' in data
      ? (data as { status?: unknown }).status
      : data;

    if (!Array.isArray(statusCandidate)) {
      return [];
    }

    return statusCandidate
      .map(status => {
        if (!status || typeof status !== 'object' || !('name' in status)) {
          return '';
        }

        const name = (status as { name?: unknown }).name;
        return typeof name === 'string' ? name : '';
      })
      .filter(name => name.length > 0);
  }

  private formatCommissionRate(rate: number | null | undefined): string {
    if (rate === null || rate === undefined || Number.isNaN(rate)) {
      return '--';
    }

    return `${rate}%`;
  }

  private toSettlementStatus(item: HotelFinancialsItem): HotelRecord['settlementStatus'] {
    const statusText = item.statusString ?? item.status;

    if (statusText && this.normalizeStatus(statusText) === 'settled') {
      return 'settled';
    }

    if (item.statusEnum === 2) {
      return 'settled';
    }

    return 'in-progress';
  }

  private toTripRecord(item: HotelTripItem, hotelId?: string): TripRecord {
    const rawDriver = item.driverName;
    const driverName = rawDriver && rawDriver !== 'null' ? rawDriver : undefined;
    const requestStatus = item.tripRequestStatusString || item.requestStatusString || 'Pending';
    const isScheduledTrip = this.isScheduledBeforeStart(item);
    const tripStatus = isScheduledTrip ? 'Scheduled' : item.tripStatusString || '';
    const effectiveTripStatus = this.resolveTripStatusText(tripStatus, requestStatus);
    const status = this.toUiTripStatus(effectiveTripStatus, isScheduledTrip);
    return {
      id: item.tripRequestId,
      tripId: item.tripId ?? undefined,
      hotelId: item.hotelId ?? hotelId,
      hotelName: item.hotelName,
      hotelPhone: item.hotelPhone?.trim() || undefined,
      tripCode: item.tripCode ?? undefined,
      customerName: item.guestName,
      pickupLocation: item.startLocation?.address ?? '--',
      dropoffLocation: item.endLocation?.address ?? '--',
      date: item.scheduledAt ?? item.startedAt ?? item.requestedAt ?? undefined,
      endDate: item.endedAt,
      status,
      tripStatus: effectiveTripStatus || 'Not Started',
      tripStatusKey: this.normalizeStatus(effectiveTripStatus || 'not-started'),
      requestStatus,
      requestStatusKey: this.normalizeStatus(requestStatus),
      isScheduled: item.isScheduled,
      price: item.fare ?? 0,
      currency: item.currency,
      distance: item.distanceInKm,
      duration: item.durationMinutes,
      paymentStatus: 'Paid',
      driverName,
      driverPhoneNumber: item.driverPhoneNumber?.trim() || item.driverPhone?.trim() || undefined,
      room: item.roomNumber != null ? String(item.roomNumber) : undefined,
      commission: item.commission ?? undefined,
      scheduledAt: item.scheduledAt,
      requestedAt: item.requestedAt,
      notes: item.notes,
      placeTypeName: item.placeTypeName,
      otherPlaceText: item.otherPlaceText,
    };
  }

  private toUiTripStatus(status: string, isScheduled = false): TripRecord['status'] {
    const normalized = this.normalizeStatus(status);

    if (normalized.includes('complete')) return 'completed';
    if (normalized.includes('cancel')) return 'cancelled';
    if (isScheduled) return 'scheduled';
    if (normalized.includes('active') || normalized.includes('progress')) return 'active';
    if (normalized.includes('schedule') || normalized.includes('schedual')) return 'scheduled';

    return 'pending';
  }

  private isScheduledBeforeStart(item: HotelTripItem): boolean {
    if (!item.isScheduled || item.startedAt) return false;

    const status = this.normalizeStatus(this.resolveTripStatusText(item.tripStatusString || '', item.tripRequestStatusString || item.requestStatusString || ''));
    return !status.includes('complete') && !status.includes('cancel') && status !== 'rejected';
  }

  private resolveTripStatusText(tripStatus: string, requestStatus: string): string {
    const requestStatusKey = this.normalizeStatus(requestStatus);
    if (requestStatusKey.includes('cancel') || requestStatusKey.includes('complete')) {
      return requestStatus;
    }

    return tripStatus || requestStatus;
  }

  private normalizeStatus(status: string): string {
    return status.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.searchRequests.next(query);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    if (this.activeTab() === 'trips') {
      this.loadTrips(this.searchQuery() || undefined, true, true);
    } else {
      this.loadHotels(this.searchQuery() || undefined, true, true);
    }
  }

  onSortChange(sortBy: HotelTripSortBy): void {
    this.tripSortBy.set(sortBy);
    this.currentPage.set(1);
    if (this.activeTab() === 'trips') {
      this.loadTrips(this.searchQuery() || undefined, true, true);
    }
  }

  onHotelSortChange(sort: { sortBy: HotelFinancialSortBy; sortDirection: SortDirection }): void {
    this.hotelSortBy.set(sort.sortBy);
    this.hotelSortDirection.set(sort.sortDirection);
    this.currentPage.set(1);
    if (this.activeTab() === 'hotels') {
      this.loadHotels(this.searchQuery() || undefined, true, true);
    }
  }

  onFilterChange(filter: { status?: string }): void {
    this.statusFilter.set(filter.status ?? '');
    this.currentPage.set(1);
    if (this.activeTab() === 'trips') {
      this.loadTrips(this.searchQuery() || undefined, true, true);
    } else {
      this.loadHotels(this.searchQuery() || undefined, true, true);
    }
  }

  onTabChange(tab: 'trips' | 'hotels'): void {
    this.activeTab.set(tab);
    this.statusFilter.set('');
    this.currentPage.set(1);
    this.loadStatusOptions(tab);
    if (tab === 'trips') {
      this.loadTrips(this.searchQuery() || undefined, true, true);
    } else {
      this.loadHotels(this.searchQuery() || undefined, true, true);
    }
  }

  onTripAction(action: { type: string; tripId: string; hotelId?: string }): void {
    if (action.type === 'view') {
      const hId = action.hotelId ?? this.hotelId();
      if (hId) {
        this.router.navigate(['/hotel-details', hId, 'trip', action.tripId]);
      }
    }
  }

  onHotelAction(action: { type: 'view' | 'settle' | 'block'; hotel: HotelRecord }): void {
    if (action.type === 'view') {
      this.router.navigate(['/hotel-details', action.hotel.id]);
      return;
    }

    if (action.type === 'settle') {
      this.hotelDetailsService
        .settleAllPayouts(action.hotel.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (result) => {
            if (result.isSuccess) {
              this.notifications.showSuccess('Payouts settled successfully.');
              this.loadHotels(this.searchQuery() || undefined);
            } else {
              this.notifications.showError(result.error?.description ?? 'Failed to settle payouts.');
            }
          },
          error: () => this.notifications.showError('Failed to settle payouts.'),
        });
      return;
    }

    this.hotelDetailsService
      .toggleBlockHotel(action.hotel.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess) {
            const message = action.hotel.hotelStatus === 'active'
              ? 'Hotel blocked successfully.'
              : 'Hotel unblocked successfully.';
            this.notifications.showSuccess(message);
            this.loadHotels(this.searchQuery() || undefined);
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to toggle hotel status.');
          }
        },
        error: () => this.notifications.showError('Failed to toggle hotel status.'),
      });
  }

  refreshData(): void {
    this.loadTrips();
    this.loadHotels();
    this.loadDashboardStats();
  }
}
