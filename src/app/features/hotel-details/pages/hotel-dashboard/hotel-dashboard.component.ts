import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  OnDestroy,
  Renderer2,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import type { HotelRecord, TripRecord } from '../../types/hotel-details.types';
import { StatisticsCardComponent, StatisticItem } from '../../components/statistics-card/statistics-card.component';
import { TripsHistoryTableComponent } from '../../components/trips-history-table/trips-history-table.component';
import { HotelDetailsService, HotelTripItem } from '../../services/hotel-details.service';
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

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly statistics = signal<StatisticItem[]>([
    { label: 'Total Hotels', value: '15', color: 'orange' },
    { label: 'Total Revenue', value: '89,456 CHF', color: 'orange' },
    { label: 'Hotels Comm.', value: '20,456 CHF', color: 'orange' },
    { label: 'Lines Net Profit', value: '20,456 CHF', color: 'orange' },
    { label: 'Active Trips', value: '120', color: 'orange' },
    { label: 'Scheduled Trips', value: '15', color: 'orange' },
    { label: 'Completed Trips', value: '15', color: 'orange' },
    { label: 'Canceled Trips', value: '40', color: 'orange' },
  ]);

  readonly trips = signal<TripRecord[]>([]);
  readonly hotels = signal<HotelRecord[]>([]);
  readonly totalTrips = signal(0);
  readonly totalHotels = signal(0);
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly filteredTrips = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allTrips = this.trips();
    if (!query) return allTrips;
    return allTrips.filter(trip =>
      trip.customerName.toLowerCase().includes(query) ||
      trip.tripCode?.toLowerCase().includes(query) ||
      trip.driverName?.toLowerCase().includes(query) ||
      trip.pickupLocation.toLowerCase().includes(query) ||
      trip.dropoffLocation.toLowerCase().includes(query) ||
      trip.status.toLowerCase().includes(query),
    );
  });

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'hotel-details-active');
    this.loadTrips();
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'hotel-details-active');
  }

  private loadTrips(): void {
    this.loading.set(true);
    this.error.set(null);

    this.hotelDetailsService.getHotelTrips(this.currentPage(), this.pageSize()).subscribe({
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

  private toTripRecord(item: HotelTripItem): TripRecord {
    const rawDriver = item.driverName;
    const driverName = rawDriver && rawDriver !== 'null' ? rawDriver : undefined;

    return {
      id: item.tripRequestId,
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
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTrips();
  }

  onTripAction(action: { type: string; tripId: string }): void {
    if (action.type === 'view') {
      this.router.navigate(['/hotel-details', 'trip', action.tripId]);
    }
  }

  refreshData(): void {
    this.loadTrips();
  }
}
