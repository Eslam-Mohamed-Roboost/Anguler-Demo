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
  import type { HotelFormData, HotelInfo, TripRecord, WithdrawalFormData } from '../../types/hotel-details.types';
import { HotelDetailsService } from '../../services/hotel-details.service';
import { HotelApiItem, HotelTripItem } from '../../models/dto';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { BaseComponent } from '../../../../shared/base/base.component';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
 
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
     PaginationComponent,
    TranslatePipe],
  templateUrl: './hotel-profile.component.html',
  styleUrl: './hotel-profile.component.css',
})
export class HotelProfileComponent extends BaseComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly renderer = inject(Renderer2);
   private readonly service = inject(HotelDetailsService);
  private readonly notifications = inject(NotificationStore);

  readonly hotelId = signal('');
  readonly searchQuery = signal('');
  readonly awaitingAmount = signal(0);

  readonly loading = signal(false);
  readonly tripsLoading = signal(false);
  readonly formLoading = signal(false);
  readonly withdrawalLoading = signal(false);
  readonly error = signal<string | null>(null);
  private dataLoaded = false;

  readonly hotelData = signal<HotelApiItem | null>(null);
  readonly withdrawalData = signal<WithdrawalFormData>({
    accountHolderName: '',
    bankName: '',
    iban: '',
    swiftCode: '',
  });

  readonly currentPage = signal(1);
  readonly pageSize = signal(10);
  readonly totalTrips = signal(0);

  readonly hotel = signal<HotelInfo>({
    id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    isBlocked: false,
  });
readonly amountLabel = signal(0)
  readonly hotelFormData = signal<Partial<HotelFormData>>({});

  readonly statistics = signal<StatisticItem[]>([
    { label: 'stats.commissionPercentage', value: '--', color: 'orange' },
    { label: 'stats.hotelBalance', value: '--', color: 'orange' },
    { label: 'stats.hotelCommission', value: '--', color: 'orange' },
    { label: 'stats.linesNetProfit', value: '--', color: 'orange' },
    { label: 'stats.activeTrips', value: '--', color: 'orange' },
    { label: 'stats.scheduledTrips', value: '--', color: 'orange' },
    { label: 'stats.completedTrips', value: '--', color: 'orange' },
    { label: 'stats.cancelledTrips', value: '--', color: 'orange' },
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
    { key: 'tripCode', header: 'Trip ID', sortable: true, headerClass: 'w-20' },
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
    if (id && !this.dataLoaded) {
      this.dataLoaded = true;
      this.loadHotel(id);
      this.loadTrips(id);
      this.loadWithdrawalDetails(id);
      this.hotelKpi(id);
    }
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'hotel-details-active');
  }
  private hotelKpi(id: string): void {
    this.loading.set(true);
    this.service.getHotelKpi(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          if (result.isSuccess && result.data) {
            const stats = result.data;
            this.statistics.set([
              { label: 'stats.commissionPercentage', value: `${(stats.commissionPercentage.value * 100).toFixed(0)}%`, color: 'orange' },
              { label: 'stats.hotelBalance', value: `${stats.hotelRevenue.value} CHF`, color: 'orange' },
              { label: 'stats.hotelCommission', value: `${stats.hotelCommission.value} CHF`, color: 'orange' },
              { label: 'stats.linesNetProfit', value: `${stats.linesNetProfit.value} CHF`, color: 'orange' },
              { label: 'stats.activeTrips', value: String(stats.activeTrips.value), color: 'orange' },
              { label: 'stats.scheduledTrips', value: String(stats.scheduledTrips.value), color: 'orange' },
              { label: 'stats.completedTrips', value: String(stats.completedTrips.value), color: 'orange' },
              { label: 'stats.cancelledTrips', value: String(stats.canceledTrips.value), color: 'orange' },
            ]);
          }
        },
        error: () => {
          this.loading.set(false);
          this.notifications.showError('Failed to load hotel KPIs.');
        },
      });
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
    this.hotelData.set(item);
    this.hotelId.set(item.code);

    this.hotel.set({
      id: item.id,
      name: item.hotelName,
      address: item.address,
      phone: item.phoneNumber,
      email: item.email,
      isBlocked: item.isBlocked ?? false,
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
      prev.map(s => s.label === 'stats.commissionPercentage' ? { ...s, value: commPct } : s),
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
        if (s.label === 'stats.activeTrips') return { ...s, value: String(counts.active) };
        if (s.label === 'stats.scheduledTrips') return { ...s, value: String(counts.scheduled) };
        if (s.label === 'stats.completedTrips') return { ...s, value: String(counts.completed) };
        if (s.label === 'stats.cancelledTrips') return { ...s, value: String(counts.cancelled) };
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

  private loadWithdrawalDetails(hotelId: string): void {
    this.withdrawalLoading.set(true);
    this.service
      .getWithdrawalDetails(hotelId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.withdrawalLoading.set(false);
          if (result.isSuccess && result.data) {
            this.withdrawalData.set({
              accountHolderName: result.data.accountHolderName,
              bankName: result.data.bankName,
              iban: result.data.bankAccountNumber,
              swiftCode: result.data.bankRoutingName,
            });
          }
        },
        error: () => this.withdrawalLoading.set(false),
      });
  }

  onFormSubmit(data: HotelFormData): void {
    const currentHotel = this.hotelData();
    if (!currentHotel) return;

    const updatePayload: HotelApiItem = {
      id: currentHotel.id,
      hotelName: data.name,
      cityId: currentHotel.cityId,
      address: data.address,
      phoneNumber: data.phone,
      email: data.email,
      locationUrl: currentHotel.locationUrl,
      logoUrl: currentHotel.logoUrl,
      commissionRate: currentHotel.commissionRate,
      isActive: currentHotel.isActive,
      isVerified: currentHotel.isVerified,
      code: currentHotel.code,
      isBlocked: currentHotel.isBlocked ?? false,
    };

    this.formLoading.set(true);
    this.service
      .updateProfile(updatePayload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.formLoading.set(false);
          if (result.isSuccess && result.data) {
            this.notifications.showSuccess('Hotel profile updated successfully.');
            this.applyHotelData(result.data);
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to update profile.');
          }
        },
        error: () => {
          this.formLoading.set(false);
          this.notifications.showError('Failed to update hotel profile.');
        },
      });
  }

  onFormCancel(): void {}

  onWithdrawalSubmit(data: WithdrawalFormData): void {
    this.withdrawalLoading.set(true);
    this.service
      .updateWithdrawalDetails({
        bankName: data.bankName,
        bankAccountNumber: data.iban,
        bankRoutingNumber: data.swiftCode,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.withdrawalLoading.set(false);
          if (result.isSuccess && result.data) {
            this.notifications.showSuccess('Withdrawal details updated successfully.');
            this.withdrawalData.set({
              accountHolderName: result.data.accountHolderName,
              bankName: result.data.bankName,
              iban: result.data.bankAccountNumber,
              swiftCode: result.data.bankRoutingName,
            });
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to update withdrawal details.');
          }
        },
        error: () => {
          this.withdrawalLoading.set(false);
          this.notifications.showError('Failed to update withdrawal details.');
        },
      });
  }

  onHotelDelete(): void {}
}
