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
import { timer } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CellDefDirective } from '../../../../shared/components/data-table/cell-def.directive';
import type { ColumnDef } from '../../../../shared/components/data-table/column-def';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { HotelInfoCardComponent } from '../../components/hotel-info-card/hotel-info-card.component';
import { StatisticsCardComponent, StatisticItem } from '../../components/statistics-card/statistics-card.component';
  import type { HotelFormData, HotelInfo, TripRecord, WithdrawalFormData } from '../../types/hotel-details.types';
import { HotelDetailsService, SettlementInfo, SettlementStatus } from '../../services/hotel-details.service';
import { HotelApiItem, HotelTripItem, TripRequestStatusItem } from '../../models/dto';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { BaseComponent } from '../../../../shared/base/base.component';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";

const TABLE_REFRESH_MS = 30_000;
 
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
    ModalComponent,
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
  readonly routeHotelId = signal('');
  readonly searchQuery = signal('');
  readonly selectedStatus = signal('');
  readonly statusOptions = signal<TripRequestStatusItem[]>([]);
  readonly awaitingAmount = signal(0);
  readonly settlementInfo = signal<SettlementInfo | null>(null);

  readonly loading = signal(false);
  readonly tripsLoading = signal(false);
  readonly statusesLoading = signal(false);
  readonly formLoading = signal(false);
  readonly withdrawalLoading = signal(false);
  readonly settleLoading = signal(false);
  readonly showSettleConfirmModal = signal(false);
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
    code: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    isBlocked: false,
  });
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

  readonly awaitingAmountLabel = computed(() =>
    `${this.awaitingAmount().toLocaleString('en-US', { maximumFractionDigits: 2 })} CHF`
  );
  readonly settlementBadgeLabel = computed(() =>
    `${this.settlementStatusText(this.currentSettlementStatus())} : ${this.awaitingAmountLabel()}`
  );
  readonly settlementBadgeClass = computed(() => {
    const status = this.currentSettlementStatus();

    if (status === SettlementStatus.Settled) {
      return 'bg-[#EAFBF2] text-[#00A63E]';
    }

    if (status === SettlementStatus.Failed) {
      return 'bg-[#FFECEC] text-[#E03131]';
    }

    return 'bg-[#FFF1F4] text-[#FF2D55]';
  });
  readonly canSettlePayout = computed(() => {
    const status = this.currentSettlementStatus();
    const hasAwaitingAmount = this.awaitingAmount() > 0;

    return hasAwaitingAmount && (
      status === SettlementStatus.Pending ||
      status === SettlementStatus.AwaitingPayout
    );
  });

  protected readonly columns = computed<ColumnDef[]>(() => [
    { key: 'tripId', header: 'Trip Code', sortable: true, headerClass: 'w-28' },
    { key: 'guestName', header: 'Guest Name', sortable: true, headerClass: 'w-32' },
    { key: 'driverName', header: 'Driver Name', sortable: true, headerClass: 'w-32' },
    { key: 'route', header: 'Route', sortable: false, headerClass: 'w-40' },
    { key: 'requestStatus', header: 'Request Status', sortable: true, headerClass: 'w-36' },
    { key: 'tripStatus', header: 'Trip Status', sortable: true, headerClass: 'w-32' },
    { key: 'fare', header: 'Fare (CHF)', sortable: true, headerClass: 'w-28' },
    { key: 'startEndDate', header: 'Start.End.Date', sortable: true, headerClass: 'w-36' },
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

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'hotel-details-active');
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id && !this.dataLoaded) {
      this.dataLoaded = true;
      this.routeHotelId.set(id);
      this.loadTripStatuses();
      this.loadHotel(id);
      this.loadTrips(id);
      this.startTripsRefresh(id);
      this.loadWithdrawalDetails(id);
      this.loadUnsettledPayouts(id);
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
              { label: 'stats.commissionPercentage', value: `${stats.commissionPercentage.value}%`, color: 'orange' },
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
      code: item.code,
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
      hotelCode: item.code,
      joiningDate: '',
    });

    const commPct = `${item.commissionRate}%`;
    this.statistics.update(prev =>
      prev.map(s => s.label === 'stats.commissionPercentage' ? { ...s, value: commPct } : s),
    );
  }

  private getCurrentHotelRouteId(): string {
    return this.route.snapshot.paramMap.get('id') ?? this.hotelId();
  }

  private loadTripStatuses(): void {
    this.statusesLoading.set(true);
    this.service
      .getTripRequestStatuses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.statusesLoading.set(false);
          if (result.isSuccess && result.data) {
            this.statusOptions.set(result.data.status);
          }
        },
        error: () => {
          this.statusesLoading.set(false);
          this.notifications.showError('Failed to load trip statuses.');
        },
      });
  }

  private startTripsRefresh(id: string): void {
    timer(TABLE_REFRESH_MS, TABLE_REFRESH_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadTrips(id, false, true));
  }

  private loadTrips(id: string, showLoading = true, skipGlobalLoading = false): void {
    if (showLoading) this.tripsLoading.set(true);
    this.service
      .getHotelTripsById(id, this.currentPage(), this.pageSize(), this.selectedStatus(), skipGlobalLoading)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (showLoading) this.tripsLoading.set(false);
          if (result.isSuccess && result.data) {
            this.trips.set(result.data.items.map(i => this.toTripRecord(i)));
            this.totalTrips.set(result.data.totalCount);
            this.updateTripStats(result.data.items);
          }
        },
        error: () => {
          if (showLoading) this.tripsLoading.set(false);
        },
      });
  }

  private updateTripStats(items: HotelTripItem[]): void {
    const counts = { active: 0, scheduled: 0, completed: 0, cancelled: 0 };
    for (const t of items) {
      const isScheduledTrip = this.isScheduledBeforeStart(t);
      const s = this.toUiTripStatus(
        this.resolveTripStatusText(
          isScheduledTrip ? 'Scheduled' : t.tripStatusString || '',
          t.tripRequestStatusString || t.requestStatusString || 'Pending',
        ),
        isScheduledTrip,
      );
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
    const requestStatus = item.tripRequestStatusString || item.requestStatusString || 'Pending';
    const isScheduledTrip = this.isScheduledBeforeStart(item);
    const tripStatus = isScheduledTrip ? 'Scheduled' : item.tripStatusString || '';
    const effectiveTripStatus = this.resolveTripStatusText(tripStatus, requestStatus);
    const status = this.toUiTripStatus(effectiveTripStatus, isScheduledTrip);
    return {
      id: item.tripRequestId,
      tripId: item.tripId ?? undefined,
      hotelId: item.hotelId,
      hotelName: item.hotelName,
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
      price: item.fare ?? 0,
      currency: item.currency,
      distance: item.distanceInKm,
      duration: item.durationMinutes,
      paymentStatus: 'Paid',
      driverName,
      driverPhoneNumber: item.driverPhoneNumber?.trim() || undefined,
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

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTrips(this.getCurrentHotelRouteId(), true, true);
  }

  protected onSearchChange(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onStatusChange(event: Event): void {
    this.selectedStatus.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
    this.loadTrips(this.getCurrentHotelRouteId(), true, true);
  }

  protected formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '--';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
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
              accountHolderName: result.data.bankAccountHolderName ?? result.data.accountHolderName ?? '',
              bankName: result.data.bankName,
              iban: result.data.bankAccountNumber,
              swiftCode: result.data.bankRoutingNumber ?? result.data.bankRoutingName ?? '',
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
        bankAccountHolderName: data.accountHolderName,
        bankName: data.bankName,
        bankAccountNumber: data.iban,
        bankRoutingNumber: data.swiftCode?.trim() ?? '',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.withdrawalLoading.set(false);
          if (result.isSuccess && result.data) {
            this.notifications.showSuccess('Withdrawal details updated successfully.');
            this.withdrawalData.set({
              accountHolderName: result.data.bankAccountHolderName ?? result.data.accountHolderName ?? '',
              bankName: result.data.bankName,
              iban: result.data.bankAccountNumber,
              swiftCode: result.data.bankRoutingNumber ?? result.data.bankRoutingName ?? '',
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

  private loadUnsettledPayouts(hotelId: string): void {
    this.service
      .getUnsettledPayouts(hotelId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data !== null) {
            this.settlementInfo.set(result.data);
            this.awaitingAmount.set(Number(result.data.value) || 0);
          }
        },
        error: () => {
          this.notifications.showError('Failed to load unsettled payouts.');
        },
      });
  }

  openSettleConfirmModal(): void {
    if (!this.canSettlePayout() || this.settleLoading()) return;
    this.showSettleConfirmModal.set(true);
  }

  closeSettleConfirmModal(): void {
    if (this.settleLoading()) return;
    this.showSettleConfirmModal.set(false);
  }

  settlePayouts(): void {
    const hotelId = this.route.snapshot.paramMap.get('id');
    if (!hotelId) return;

    this.settleLoading.set(true);
    this.service
      .settleAllPayouts(hotelId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.settleLoading.set(false);
          if (result.isSuccess) {
            this.showSettleConfirmModal.set(false);
            this.notifications.showSuccess('Payouts settled successfully.');
            this.loadUnsettledPayouts(hotelId);
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to settle payouts.');
          }
        },
        error: () => {
          this.settleLoading.set(false);
          this.notifications.showError('Failed to settle payouts.');
        },
      });
  }

  private settlementStatusText(status: SettlementStatus | null): string {
    switch (status) {
      case SettlementStatus.Pending:
        return 'Pending';
      case SettlementStatus.AwaitingPayout:
        return 'Awaiting Payout';
      case SettlementStatus.Settled:
        return 'Settled';
      case SettlementStatus.Failed:
        return 'Failed';
      default:
        return 'Awaiting Payout';
    }
  }

  private currentSettlementStatus(): SettlementStatus | null {
    const info = this.settlementInfo();

    return this.normalizeSettlementStatus(
      info?.settelStatue ??
      info?.settleStatue ??
      info?.settleStatus ??
      info?.status ??
      info?.statusEnum ??
      info?.statusString,
    );
  }

  private normalizeSettlementStatus(
    status: SettlementInfo['settelStatue'] | SettlementInfo['statusEnum'] | undefined,
  ): SettlementStatus | null {
    if (typeof status === 'number') {
      return status;
    }

    if (!status) {
      return null;
    }

    const normalized = status.trim().toLowerCase();
    const numericStatus = Number(normalized);

    if (Number.isInteger(numericStatus) && numericStatus in SettlementStatus) {
      return numericStatus as SettlementStatus;
    }

    const normalizedKey = normalized.replace(/[^a-z0-9]+/g, '');

    switch (normalizedKey) {
      case 'pending':
        return SettlementStatus.Pending;
      case 'awaitingpayout':
        return SettlementStatus.AwaitingPayout;
      case 'settled':
        return SettlementStatus.Settled;
      case 'failed':
        return SettlementStatus.Failed;
      default:
        return null;
    }
  }
}
