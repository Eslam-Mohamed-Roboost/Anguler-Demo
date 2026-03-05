import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import type { HotelRecord, TripRecord } from '../../types/hotel-details.types';
import { StatisticsCardComponent, StatisticItem } from '../../components/statistics-card/statistics-card.component';
import { TripsHistoryTableComponent } from '../../components/trips-history-table/trips-history-table.component';
import { HotelDetailsService } from '../../services/hotel-details.service';
import { GetDriverTripsQuery } from '../../services/api.types';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-hotel-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    StatisticsCardComponent,
    TripsHistoryTableComponent,
    IconComponent,
  ],
  templateUrl: './hotel-details.component.html',
  styleUrl: './hotel-details.component.css',
})
export class HotelDetailsComponent implements OnInit, OnDestroy {
  private readonly hotelDetailsService = inject(HotelDetailsService);
  private readonly renderer = inject(Renderer2);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalTrips = signal(180);

  readonly statistics = signal<StatisticItem[]>([]);

  readonly trips = signal<TripRecord[]>([]);
  readonly hotels = signal<HotelRecord[]>([]);
  readonly totalHotels = signal(100);
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  readonly filteredTrips = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const allTrips = this.trips();
    if (!query) return allTrips;
    return allTrips.filter(trip =>
      trip.customerName.toLowerCase().includes(query) ||
      trip.hotelName?.toLowerCase().includes(query) ||
      trip.driverName?.toLowerCase().includes(query) ||
      trip.pickupLocation.toLowerCase().includes(query) ||
      trip.dropoffLocation.toLowerCase().includes(query) ||
      trip.status.toLowerCase().includes(query)
    );
  });

  readonly statisticsCards = computed(() => this.statistics());

  constructor() {
    this.initializeMockData();
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'hotel-details-active');
    this.loadDriverTrips();
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'hotel-details-active');
  }

  private loadDriverTrips(): void {
    const query: GetDriverTripsQuery = {
      PageNumber: this.currentPage(),
      PageSize: this.pageSize(),
    };
    this.hotelDetailsService.getDriverTrips(query).subscribe({
      next: (response) => {
        const tripRecords = (response.items || []).map((trip: any) =>
          this.hotelDetailsService.convertApiTripToTripRecord(trip)
        );
        this.trips.set(tripRecords);
      },
      error: (err) => {
        console.error('Failed to load trips:', err);
        this.error.set('Failed to load trips data');
      },
    });
  }

  private initializeMockData(): void {
    this.statistics.set([
      { label: 'Total Hotels', value: '15', color: 'orange' },
      { label: 'Total Revenue', value: '89,456 CHF', color: 'orange' },
      { label: 'Hotels Comm.', value: '20,456 CHF', color: 'orange' },
      { label: 'Lines Net Profit', value: '20,456 CHF', color: 'orange' },
      { label: 'Active Trips', value: '120', color: 'orange' },
      { label: 'Scheduled Trips', value: '15', color: 'orange' },
      { label: 'Completed Trips', value: '15', color: 'orange' },
      { label: 'Canceled Trips', value: '40', color: 'orange' },
    ]);

    const mockTrip = (status: TripRecord['status']): TripRecord => ({
      id: 'TR001',
      customerName: 'Alice Johnson',
      pickupLocation: 'Hotel District A',
      dropoffLocation: 'Airport',
      date: '2024-01-15T14:30:00Z',
      endDate: status === 'active' || status === 'scheduled' ? undefined : '2024-01-15T15:00:00Z',
      status,
      price: 18.50,
      currency: 'CHF',
      distance: 12.5,
      duration: 25,
      paymentStatus: 'Paid',
      hotelName: 'Hotel Name',
      hotelPhone: '00215236582458',
      driverName: 'Ahmed Johnson',
      driverId: 'P45263',
      room: 'Room 24',
      commission: 3.70,
    });

    const mockHotel = (status: HotelRecord['hotelStatus'], settlement: HotelRecord['settlementStatus'], amount: string): HotelRecord => ({
      id: 'PO001',
      hotelName: 'Gawhara Hotel',
      hotelStatus: status,
      totalTrips: 40,
      hotelComm: '5%',
      hotelProfits: '870 CHF',
      linesProfits: '520 CHF',
      monthlyDues: '520 CHF',
      settlementStatus: settlement,
      settlementAmount: amount,
    });

    this.hotels.set([
      mockHotel('active', 'in-progress', '260 CHF'),
      mockHotel('suspended', 'settled', '280 CHF'),
      mockHotel('active', 'in-progress', '260 CHF'),
      mockHotel('active', 'settled', '280 CHF'),
      mockHotel('active', 'in-progress', '260 CHF'),
      mockHotel('active', 'settled', '280 CHF'),
      mockHotel('active', 'in-progress', '260 CHF'),
      mockHotel('active', 'settled', '280 CHF'),
      mockHotel('active', 'in-progress', '260 CHF'),
      mockHotel('active', 'in-progress', '260 CHF'),
    ]);

    this.trips.set([
      mockTrip('scheduled'),
      mockTrip('active'),
      mockTrip('cancelled'),
      mockTrip('pending'),
      mockTrip('completed'),
      mockTrip('scheduled'),
      mockTrip('completed'),
      mockTrip('completed'),
      mockTrip('completed'),
      mockTrip('completed'),
    ]);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onTripAction(action: { type: string; tripId: string }): void {
    if (action.type === 'view') {
      console.log('View trip:', action.tripId);
    }
  }

  refreshData(): void {
    this.error.set(null);
    this.loadDriverTrips();
  }
}
