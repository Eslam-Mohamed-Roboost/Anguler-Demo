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
import { HotelDetailsService, HotelApiItem, HotelTripItem, DashboardStatsResponse } from '../../services/hotel-details.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

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

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hotelId = signal<string>('');

  readonly statistics = signal<StatisticItem[]>(this.buildStatistics());

  readonly trips = signal<TripRecord[]>([]);
  readonly hotels = signal<HotelRecord[]>([]);
  readonly totalTrips = signal(0);
  readonly totalHotels = signal(0);
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly filteredTrips = computed(() => this.trips());

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'hotel-details-active');
    this.loadProfile();
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
      { label: 'Total Hotels', value: count(stats?.totalHotels ?? 0), color: 'orange' },
      { label: 'Total Revenue', value: currency(stats?.totalRevenue ?? 0), color: 'orange' },
      { label: 'Hotels Comm.', value: currency(stats?.hotelsCommission ?? 0), color: 'orange' },
      { label: 'Lines Net Profit', value: currency(stats?.linesNetProfit ?? 0), color: 'orange' },
      { label: 'Active Trips', value: count(stats?.activeTrips ?? 0), color: 'orange' },
      { label: 'Scheduled Trips', value: count(stats?.scheduledTrips ?? 0), color: 'orange' },
      { label: 'Completed Trips', value: count(stats?.completedTrips ?? 0), color: 'orange' },
      { label: 'Canceled Trips', value: count(stats?.canceledTrips ?? 0), color: 'orange' },
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

  private loadTrips(): void {
    this.loading.set(true);
    this.error.set(null);

    this.hotelDetailsService
      .getHotelTrips(this.currentPage(), this.pageSize(), undefined, this.searchQuery() || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          if (result.isSuccess && result.data) {
            this.trips.set(result.data.items.map(item => this.toTripRecord(item)));
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

  private loadHotels(): void {
    this.hotelDetailsService
      .getAllHotels(1, 100, this.searchQuery() || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.hotels.set(result.data.items.map(item => this.toHotelRecord(item)));
            this.totalHotels.set(result.data.totalCount);
          }
        },
      });
  }

  private toHotelRecord(item: HotelApiItem): HotelRecord {
    return {
      id: item.id,
      hotelName: item.hotelName,
      hotelStatus: item.isActive ? 'active' : 'suspended',
      totalTrips: 0,
      hotelComm: `${(item.commissionRate * 100).toFixed(0)}%`,
      hotelProfits: '--',
      linesProfits: '--',
      monthlyDues: '--',
      settlementStatus: 'in-progress',
      settlementAmount: '--',
    };
  }

  private toTripRecord(item: HotelTripItem): TripRecord {
    const rawDriver = item.driverName;
    const driverName = rawDriver && rawDriver !== 'null' ? rawDriver : undefined;
    console.log(item)
    return {
      id: item.tripRequestId,
      hotelName: item.hotelName,
      tripCode: item.tripCode,
      customerName: item.guestName,
      pickupLocation: item.startLocation.address,
      dropoffLocation: item.endLocation.address,
      date: item.startedAt,
      endDate: item.endedAt,
      status: item.status.toLowerCase() as TripRecord['status'],
      price: item.fare ?? 0,
      currency: item.currency,
      distance: item.distanceInKm,
      duration: item.durationMinutes,
      paymentStatus: 'Paid',
      driverName,
      room: item.roomNumber != null ? String(item.roomNumber) : undefined,
      commission: item.commission ?? undefined,
    };
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadTrips();
    this.loadHotels();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTrips();
  }

  onTripAction(action: { type: string; tripId: string; hotelId?: string }): void {
    if (action.type === 'view') {
      const hId = action.hotelId ?? this.hotelId();
      if (hId) {
        this.router.navigate(['/hotel-details', hId, 'trip', action.tripId]);
      } else {
        this.router.navigate(['/hotel-details', 'trip', action.tripId]);
      }
    }
  }

  refreshData(): void {
    this.loadTrips();
    this.loadHotels();
    this.loadDashboardStats();
  }
}
