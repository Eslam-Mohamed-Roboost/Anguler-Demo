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
import type { HotelRecord, TripRecord } from '../../types/hotel-details.types';
import { StatisticsCardComponent, StatisticItem } from '../../components/statistics-card/statistics-card.component';
import { TripsHistoryTableComponent } from '../../components/trips-history-table/trips-history-table.component';
import { HotelDetailsService } from '../../services/hotel-details.service';
import { HotelFinancialsItem, HotelTripItem, DashboardStatsResponse } from '../../models/dto';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { NotificationStore } from '../../../../core/stores/notification.store';

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
    this.loadDashboardStats();
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

  private loadDashboardStats(): void {
    const now = new Date();
    const yearAgo = new Date(now);
    yearAgo.setFullYear(now.getFullYear() - 1);
    const fromDate = this.formatDateParam(yearAgo);
    const toDate = this.formatDateParam(now);

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

  private buildStatistics(stats?: DashboardStatsResponse): StatisticItem[] {
    const currency = (n: number) => `${n.toLocaleString()} CHF`;
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

  private loadTrips(search?: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.hotelDetailsService
      .getHotelTrips(this.currentPage(), this.pageSize(), this.statusFilter() || undefined, search)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          if (result.isSuccess && result.data) {
            this.trips.set(result.data.items.map(item => this.toTripRecord(item, result.data?.hotelId)));
            this.totalTrips.set(result.data.totalCount);
          } else {
            this.error.set(result.error?.description ?? 'Failed to load trips data');
          }
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Failed to load trips data');
        },
      });
  }

  private loadHotels(sortBy: number = 0, search?: string): void {
    this.hotelDetailsService
      .getAllHotels(this.currentPage(), this.pageSize(), sortBy, this.statusFilter() || undefined, search)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.hotels.set(result.data.items.map((item, index) => this.toHotelRecord(item, index)));
            this.totalHotels.set(result.data.totalCount);
          }
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
            this.statusOptions.set(result.data.status.map(status => status.name));
          } else {
            this.statusOptions.set([]);
          }
        },
        error: () => this.statusOptions.set([]),
      });
  }

  private toHotelRecord(item: HotelFinancialsItem, index: number): HotelRecord {
    const code = item.code?.trim() || this.buildFallbackHotelCode(index);

    return {
      id: item.hotelId,
      code,
      displayId: code,
      hotelName: item.hotelName,
      hotelStatus: item.isActive ? 'active' : 'suspended',
      totalTrips: item.totalTrips,
      hotelComm: `${(item.commissionRate * 100).toFixed(2)}%`,
      hotelProfits: item.hotelProfits.toFixed(2),
      linesProfits: item.linesProfits.toFixed(2),
      monthlyDues: item.monthlyDues.toFixed(2),
      settlementStatus: item.status?.toLowerCase() === 'settled' ? 'settled' : 'in-progress',
      settlementAmount: item.totalFare.toFixed(2),
    };
  }

  private buildFallbackHotelCode(index: number): string {
    const itemNumber = ((this.currentPage() - 1) * this.pageSize()) + index + 1;
    return `P${String(itemNumber).padStart(4, '0')}`;
  }

  private toTripRecord(item: HotelTripItem, hotelId?: string): TripRecord {
    const rawDriver = item.driverName;
    const driverName = rawDriver && rawDriver !== 'null' ? rawDriver : undefined;
    const requestStatus = item.requestStatusString || 'Pending';
    const tripStatus = item.tripStatusString || '';
    const status = this.toUiTripStatus(tripStatus || requestStatus);
    return {
      id: item.tripRequestId,
      tripId: item.tripId ?? undefined,
      hotelId: item.hotelId ?? hotelId,
      hotelName: item.hotelName,
      tripCode: item.tripCode ?? undefined,
      customerName: item.guestName,
      pickupLocation: item.startLocation?.address ?? '--',
      dropoffLocation: item.endLocation?.address ?? '--',
      date: item.startedAt ?? item.requestedAt ?? undefined,
      endDate: item.endedAt,
      status,
      tripStatus: tripStatus || 'Not Started',
      tripStatusKey: this.normalizeStatus(tripStatus || 'not-started'),
      requestStatus,
      requestStatusKey: this.normalizeStatus(requestStatus),
      price: item.fare ?? 0,
      currency: item.currency,
      distance: item.distanceInKm,
      duration: item.durationMinutes,
      paymentStatus: 'Paid',
      driverName,
      room: item.roomNumber != null ? String(item.roomNumber) : undefined,
      commission: item.commission ?? undefined,
      requestedAt: item.requestedAt,
      notes: item.notes,
      placeTypeName: item.placeTypeName,
      otherPlaceText: item.otherPlaceText,
    };
  }

  private toUiTripStatus(status: string): TripRecord['status'] {
    const normalized = this.normalizeStatus(status);

    if (normalized.includes('complete')) return 'completed';
    if (normalized.includes('active') || normalized.includes('progress')) return 'active';
    if (normalized.includes('schedule')) return 'scheduled';
    if (normalized.includes('cancel')) return 'cancelled';

    return 'pending';
  }

  private normalizeStatus(status: string): string {
    return status.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    if (this.activeTab() === 'trips') {
      this.loadTrips(query || undefined);
    } else {
      this.loadHotels(0, query || undefined);
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    if (this.activeTab() === 'trips') {
      this.loadTrips(this.searchQuery() || undefined);
    } else {
      this.loadHotels(0, this.searchQuery() || undefined);
    }
  }

  onSortChange(sortOrder: 'asc' | 'desc'): void {
    this.currentPage.set(1);
    this.loadHotels(sortOrder === 'asc' ? 0 : 1);
  }

  onFilterChange(filter: { status?: string }): void {
    this.statusFilter.set(filter.status ?? '');
    this.currentPage.set(1);
    if (this.activeTab() === 'trips') {
      this.loadTrips(this.searchQuery() || undefined);
    } else {
      this.loadHotels(0, this.searchQuery() || undefined);
    }
  }

  onTabChange(tab: 'trips' | 'hotels'): void {
    this.activeTab.set(tab);
    this.statusFilter.set('');
    this.currentPage.set(1);
    this.loadStatusOptions(tab);
    if (tab === 'trips') {
      this.loadTrips(this.searchQuery() || undefined);
    } else {
      this.loadHotels(0, this.searchQuery() || undefined);
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
              this.loadHotels(0, this.searchQuery() || undefined);
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
            this.loadHotels(0, this.searchQuery() || undefined);
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
