import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CellDefDirective } from '../../../../shared/components/data-table/cell-def.directive';
import type { ColumnDef } from '../../../../shared/components/data-table/column-def';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { HotelInfoCardComponent } from '../../components/hotel-info-card/hotel-info-card.component';
import { StatisticsCardComponent, StatisticItem } from '../../components/statistics-card/statistics-card.component';
import { HotelDetailsFormComponent } from '../../components/hotel-details-form/hotel-details-form.component';
import { WithdrawalDetailsComponent } from '../../components/withdrawal-details/withdrawal-details.component';
import type { HotelFormData, HotelInfo, TripRecord, WithdrawalFormData } from '../../types/hotel-details.types';
import { HotelDetailsService, HotelApiItem, HotelTripItem } from '../../services/hotel-details.service';

@Component({
  selector: 'app-hotel-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CardComponent,
    IconComponent,
    DataTableComponent,
    CellDefDirective,
    HotelInfoCardComponent,
    StatisticsCardComponent,
    HotelDetailsFormComponent,
    WithdrawalDetailsComponent,
    PaginationComponent,
  ],
  templateUrl: './hotel-profile.component.html',
  styleUrl: './hotel-profile.component.css',
})
export class HotelProfileComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(HotelDetailsService);

  readonly hotelId = signal('');
  readonly searchQuery = signal('');
  readonly awaitingAmount = signal(0);

  readonly loading = signal(false);
  readonly tripsLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalTrips = signal(0);

  readonly hotel = signal<HotelInfo>({
    id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  readonly hotelFormData = signal<Partial<HotelFormData>>({});

  readonly statistics = signal<StatisticItem[]>([
    { label: 'Commi. Percentage (%)', value: '--', color: 'orange' },
    { label: 'Hotel Balance', value: '--', color: 'orange' },
    { label: 'Hotels Commi.', value: '--', color: 'orange' },
    { label: 'Lines Net Profit', value: '--', color: 'orange' },
    { label: 'Active Trips', value: '--', color: 'orange' },
    { label: 'Scheduled Trips', value: '--', color: 'orange' },
    { label: 'Completed Trips', value: '--', color: 'orange' },
    { label: 'Cancelled Trips', value: '--', color: 'orange' },
  ]);

  readonly trips = signal<TripRecord[]>([]);

  readonly filteredTrips = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.trips();
    return this.trips().filter(t =>
      t.customerName.toLowerCase().includes(q) ||
      t.driverName?.toLowerCase().includes(q) ||
      t.pickupLocation.toLowerCase().includes(q) ||
      t.dropoffLocation.toLowerCase().includes(q),
    );
  });

  protected readonly columns = computed<ColumnDef[]>(() => [
    { key: 'id', header: 'Trip ID', sortable: true, headerClass: 'w-20' },
    { key: 'guest', header: 'Guest', sortable: true, headerClass: 'w-32' },
    { key: 'driver', header: 'Driver', sortable: true, headerClass: 'w-32' },
    { key: 'route', header: 'Route', sortable: false, headerClass: 'w-40' },
    { key: 'duration', header: 'Duration', sortable: true, headerClass: 'w-24' },
    { key: 'fare', header: 'Fare', sortable: true, headerClass: 'w-24' },
    { key: 'date', header: 'Date', sortable: true, headerClass: 'w-32' },
    { key: 'actions', header: 'Actions', sortable: false, headerClass: 'w-16' },
  ]);

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'hotel-details-active');
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.hotelId.set(id);
    if (id) {
      this.loadHotel(id);
      this.loadTrips(id);
    }
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'hotel-details-active');
  }

  private loadHotel(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .getHotelById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          if (result.isSuccess && result.data) {
            this.applyHotelData(result.data);
          } else {
            this.error.set(result.error?.description ?? 'Failed to load hotel data.');
          }
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Failed to load hotel data.');
        },
      });
  }

  private applyHotelData(item: HotelApiItem): void {
    this.hotel.set({
      id: item.id,
      name: item.hotelName,
      address: item.address,
      phone: item.phoneNumber,
      email: item.email,
      imageUrl: item.logoUrl || undefined,
    });

    this.hotelFormData.set({
      name: item.hotelName,
      address: item.address,
      email: item.email,
      phone: item.phoneNumber,
      hotelCode: item.id,
      joiningDate: '',
    });

    const commPct = `${(item.commissionRate * 100).toFixed(0)}%`;
    this.statistics.update(prev =>
      prev.map(s => s.label === 'Commi. Percentage (%)' ? { ...s, value: commPct } : s),
    );
  }

  private loadTrips(id: string): void {
    this.tripsLoading.set(true);
    this.service
      .getHotelTripsById(id, this.currentPage(), this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.tripsLoading.set(false);
          if (result.isSuccess && result.data) {
            this.trips.set(result.data.items.map(i => this.toTripRecord(i)));
            this.totalTrips.set(result.data.totalCount);
            this.updateTripStats(result.data.items);
          }
        },
        error: () => this.tripsLoading.set(false),
      });
  }

  private updateTripStats(items: HotelTripItem[]): void {
    const counts = { active: 0, scheduled: 0, completed: 0, cancelled: 0 };
    for (const t of items) {
      const s = t.status.toLowerCase();
      if (s === 'active') counts.active++;
      else if (s === 'scheduled') counts.scheduled++;
      else if (s === 'completed') counts.completed++;
      else if (s === 'cancelled') counts.cancelled++;
    }
    this.statistics.update(prev =>
      prev.map(s => {
        if (s.label === 'Active Trips') return { ...s, value: String(counts.active) };
        if (s.label === 'Scheduled Trips') return { ...s, value: String(counts.scheduled) };
        if (s.label === 'Completed Trips') return { ...s, value: String(counts.completed) };
        if (s.label === 'Cancelled Trips') return { ...s, value: String(counts.cancelled) };
        return s;
      }),
    );
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

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTrips(this.hotelId());
  }

  protected onSearchChange(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '--';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(dateStr));
  }

  onFormSubmit(_data: HotelFormData): void {}
  onFormCancel(): void {}
  onWithdrawalSubmit(_data: WithdrawalFormData): void {}
  onHotelDelete(): void {}
}
