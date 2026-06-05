import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ChatComponent } from '../../../TripDetails/components/chat/chat.component';
import { HotelInfoCardComponent } from '../../components/hotel-info-card/hotel-info-card.component';
import { HotelDetailsService } from '../../services/hotel-details.service';
import { TripDetailsService } from '../../../TripDetails/services/trip-details.service';
import type { TripDetailsResponse } from '../../../TripDetails/models/trip-details.model';
import type { HotelInfo } from '../../types/hotel-details.types';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { SkeletonBlockComponent } from '../../../../shared/components/skeleton/skeleton-block.component';
import { AuthService } from '../../../../core/services/auth.service';
import { HotelRequestsService, type DriverItem } from '../../../admin-dashboard/services/hotel-requests.service';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { AppConfigService } from '../../../../core/services/app-config.service';

export interface TripDetail {
  tripId: string;
  tripCode?: string | null;
  guestName: string;
  roomNo: string;
  destinations: string;
  fare: number;
  hotelProfits: number;
  commissionRate: number;
  startDate: string;
  endDate?: string;
  tripRate?: number;
  status: 'active' | 'completed' | 'cancelled' | 'scheduled' | 'pending';
  hotelNote?: string;
  carType: string;
}

@Component({
  selector: 'app-hotel-trip-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    // RouterLink,
    CardComponent,
    IconComponent,
    ChatComponent,
    HotelInfoCardComponent,
    TranslatePipe,
    SkeletonBlockComponent,
  ],
  templateUrl: './hotel-trip-detail.component.html',
  styleUrl: './hotel-trip-detail.component.css',
})
export class HotelTripDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly renderer = inject(Renderer2);
  private readonly hotelDetailsService = inject(HotelDetailsService);
  private readonly tripDetailsService = inject(TripDetailsService);
  private readonly authService = inject(AuthService);
  private readonly hotelRequestsService = inject(HotelRequestsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notifications = inject(NotificationStore);
  private readonly appConfig = inject(AppConfigService);

  readonly isAdmin = computed(() => this.authService.hasRole('admin'));
  readonly commissionPercentage = computed(() => this.appConfig.commissionPercentage());
  readonly hotelProfitLabel = computed(() =>
    `Hotel Profit (CHF) =`
  );

  readonly hotelId = signal('');
  readonly tripId = signal('');
  readonly hotelLoading = signal(false);
  readonly tripLoading = signal(false);
  readonly chatHasError = signal(false);
  readonly hasHotelData = computed(() => {
    const hotel = this.hotel();
    return !!(hotel.id || this.hotelId() || hotel.name || hotel.email || hotel.phone || hotel.address);
  });
  readonly shouldShowHotelCard = computed(() => this.hasHotelData() || !!this.trip());

  private tripDetailsLoaded = false;
  private hotelDetailsLoaded = false;

  // Assign driver
  readonly drivers = signal<DriverItem[]>([]);
  readonly driversLoading = signal(false);
  readonly selectedDriverId = signal('');
  readonly assignLoading = signal(false);
  readonly rawStatus = signal('');
  readonly actionLoading = signal(false);

  readonly hotel = signal<HotelInfo>({
    id: '',
    code: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    imageUrl: '',
    isBlocked: false,
  });

  readonly trip = signal<TripDetail | null>(null);

  readonly statusLabel = computed(() => {
    const status = this.trip()?.status;
    if (!status) return 'hotelTrip.statusPending' as const;
    const map = {
      active: 'hotelTrip.statusActive',
      completed: 'hotelTrip.statusCompleted',
      cancelled: 'hotelTrip.statusCancelled',
      scheduled: 'hotelTrip.statusScheduled',
      pending: 'hotelTrip.statusPending',
    } as const;
    return map[status] ?? ('hotelTrip.statusPending' as const);
  });

  readonly statusBadgeClass = computed(() => {
    const status = this.trip()?.status;
    if (!status) return '';
    const map: Record<string, string> = {
      active: 'text-status-active bg-status-active-bg',
      pending: 'text-status-scheduled bg-status-scheduled-bg',
      completed: 'text-status-completed bg-status-completed-bg',
      cancelled: 'text-status-cancelled bg-status-cancelled-bg',
      scheduled: 'text-status-scheduled bg-status-scheduled-bg',
    };
    return map[status] ?? '';
  });

  readonly canAccept = computed(() => {
    if (this.isTripFinished()) return false;

    const status = this.normalizeStatus(this.rawStatus());
    return status === 'pending' || this.isScheduledStatus(status);
  });

  readonly canMarkArrived = computed(() => {
    if (this.isTripFinished()) return false;

    const status = this.normalizeStatus(this.rawStatus());
    return status === 'accepted' || status === 'inprogress' || status === 'arrived';
  });

  readonly canStartTrip = computed(() => {
    if (this.isTripFinished()) return false;

    const status = this.normalizeStatus(this.rawStatus());
    return status === 'accepted' || status === 'inprogress' || status === 'arrived';
  });

  readonly canCompleteTrip = computed(() => {
    if (this.isTripFinished()) return false;

    const status = this.normalizeStatus(this.rawStatus());
    return status === 'accepted' || status === 'inprogress' || status === 'arrived';
  });

  readonly canCancelTrip = computed(() => {
    if (this.isTripFinished()) return false;

    const status = this.normalizeStatus(this.rawStatus());
    return status === 'pending' || this.isScheduledStatus(status);
  });

  readonly canEndTrip = computed(() => {
    if (this.isTripFinished()) return false;

    const status = this.normalizeStatus(this.rawStatus());
    return status === 'accepted' || status === 'inprogress' || status === 'arrived';
  });

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'hotel-details-active');
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.loadRouteData(params.get('id'), params.get('tripId'));
      });
  }

  private loadRouteData(hotelIdValue: string | null, tripIdValue: string | null): void {
    const hotelId = this.cleanId(hotelIdValue);
    const tripId = this.cleanId(tripIdValue);

    if (hotelId && !this.hotelDetailsLoaded && !this.hotelLoading()) {
      this.hotelId.set(hotelId);
      this.ensureHotelIdentity(hotelId);
      this.loadHotelById(hotelId);
    }

    if (tripId && !this.tripDetailsLoaded && !this.tripLoading()) {
      this.tripId.set(tripId);
      this.loadTripDetails(tripId);
    }
  }

  private loadHotelById(hotelId: string): void {
    this.ensureHotelIdentity(hotelId);
    this.hotelLoading.set(true);
    this.hotelDetailsService.getHotelById(hotelId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            const h = result.data;
            this.hotel.set({
              id: h.id,
              code: h.code,
              name: h.hotelName,
              address: h.address,
              phone: h.phoneNumber,
              email: h.email,
              imageUrl: h.logoUrl ?? '',
              isBlocked: h.isBlocked ?? false,
            });
            this.finishHotelLoad();
            return;
          }
          this.loadHotelFallbackById(hotelId);
        },
        error: () => this.loadHotelFallbackById(hotelId),
      });
  }

  private loadHotelFallbackById(hotelId: string): void {
    if (!this.isAdmin()) {
      this.finishHotelLoad();
      return;
    }

    this.hotelDetailsService.getAllHotels(1, 100, 0, undefined, hotelId, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          const item = result.data?.items.find((hotel) => hotel.hotelId === hotelId);
          if (result.isSuccess && item) {
            this.hotel.set({
              id: item.hotelId,
              code: '',
              name: item.hotelName,
              address: '',
              phone: item.hotelPhone ?? '',
              email: '',
              imageUrl: '',
              isBlocked: !item.isActive,
            });
          }
          this.finishHotelLoad();
        },
        error: () => this.finishHotelLoad(),
      });
  }

  private finishHotelLoad(): void {
    this.hotelLoading.set(false);
    this.hotelDetailsLoaded = true;
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'hotel-details-active');
  }

  private loadTripDetails(tripRequestId: string): void {
    this.tripLoading.set(true);
    this.tripDetailsService.getTripByRequestId(tripRequestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.tripLoading.set(false);
          this.tripDetailsLoaded = true;
          if (result.isSuccess && result.data) {
            this.rawStatus.set(this.resolveEffectiveStatus(result.data));
            this.trip.set(this.toTripDetail(result.data));
            this.syncHotelFromTrip(result.data, tripRequestId);

            const status = this.normalizeStatus(this.rawStatus());
            if (this.isAdmin() && (status === 'pending' || this.isScheduledStatus(status))) {
              this.loadDrivers();
            }
          }
        },
        error: () => { this.tripLoading.set(false); this.tripDetailsLoaded = true; },
      });
  }

  private syncHotelFromTrip(data: TripDetailsResponse, tripRequestId: string): void {
    const hotelId = this.cleanId(data.hotelId) || this.cleanId(data.hotel?.id);

    if (hotelId && hotelId !== this.hotelId()) {
      this.hotelId.set(hotelId);
      this.ensureHotelIdentity(hotelId);
      this.cacheAdminHotelRoute(hotelId, tripRequestId);
    }

    const hotelFromTrip = this.toHotelInfoFromTrip(data, hotelId);
    if (hotelFromTrip) {
      this.hotel.set(hotelFromTrip);
      this.hotelLoading.set(false);
      this.hotelDetailsLoaded = true;
      return;
    }

    if (hotelId && !this.hotelDetailsLoaded && !this.hotelLoading()) {
      this.loadHotelById(hotelId);
    }
  }

  private toHotelInfoFromTrip(data: TripDetailsResponse, hotelId: string): HotelInfo | null {
    if (data.hotel) {
      return {
        id: hotelId || data.hotel.id,
        name: data.hotel.hotelName,
        address: data.hotel.address,
        phone: data.hotel.phoneNumber,
        email: data.hotel.email,
        imageUrl: data.hotel.logoUrl ?? '',
        isBlocked: false,
        code: data.hotel.code ?? '',
      };
    }

    const name = this.cleanText(data.hotelName);
    const address = this.cleanText(data.hotelAddress);
    const phone = this.cleanText(data.hotelPhoneNumber) || this.cleanText(data.hotelPhone);
    const email = this.cleanText(data.hotelEmail);
    const imageUrl = this.cleanText(data.hotelLogoUrl);
    const code = this.cleanText(data.hotelCode);

    if (!name && !address && !phone && !email && !imageUrl && !code) {
      return null;
    }

    return {
      id: hotelId,
      name,
      address,
      phone,
      email,
      imageUrl,
      isBlocked: false,
      code,
    };
  }

  private ensureHotelIdentity(hotelId: string): void {
    const id = this.cleanId(hotelId);
    if (!id || this.hotel().id === id) return;

    this.hotel.update((hotel) => ({
      ...hotel,
      id,
    }));
  }

  private cacheAdminHotelRoute(hotelId: string, tripRequestId: string): void {
    const routeHotelId = this.cleanId(this.route.snapshot.paramMap.get('id'));
    if (routeHotelId || !this.isAdmin()) return;

    void this.router.navigate(['/hotel-details', hotelId, 'trip', tripRequestId], {
      replaceUrl: true,
    });
  }

  private toTripDetail(data: TripDetailsResponse): TripDetail {
    const effectiveStatus = this.resolveEffectiveStatus(data);
    const normalizedStatus = this.normalizeStatus(effectiveStatus);
    const isCompletedTrip = this.isCompletedStatus(effectiveStatus) || !!data.endedAt;
    const isCancelledTrip = this.isCancelledStatus(effectiveStatus) || effectiveStatus === 'rejected';
    const isScheduledTrip = data.isScheduled && !data.startedAt && !isCompletedTrip && !isCancelledTrip;
    const statusMap: Record<string, TripDetail['status']> = {
      pending: 'pending',
      accepted: isScheduledTrip ? 'scheduled' : 'active',
      arrived: 'active',
      inprogress: 'active',
      completed: 'completed',
      cancelled: 'cancelled',
      canceled: 'cancelled',
      rejected: 'cancelled',
      scheduled: 'scheduled',
      schedualed: 'scheduled',
    };

    return {
      tripId: data.tripRequestId,
      tripCode: data.tripCode,
      guestName: data.guestName,
      roomNo: String(data.roomNumber),
      destinations: data.endLocation.address,
      fare: data.actualFare ?? data.estimatedPrice,
      hotelProfits: this.calculateHotelProfit(data.actualFare ?? data.estimatedPrice, data.commission),
      commissionRate: data.commission ?? this.commissionPercentage(),
      startDate: data.scheduledAt ?? data.startedAt ?? data.requestedAt,
      endDate: data.endedAt ?? undefined,
      tripRate: undefined,
      status: isScheduledTrip ? 'scheduled' : isCompletedTrip ? 'completed' : isCancelledTrip ? 'cancelled' : statusMap[normalizedStatus] ?? 'pending',
      hotelNote: data.notes || data.specialRequests,
      carType: 'Van',
    };
  }

  private loadDrivers(): void {
    this.driversLoading.set(true);
    this.hotelRequestsService.getDrivers(1, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.driversLoading.set(false);
          if (result.isSuccess && result.data) {
            this.drivers.set(result.data.items);
          }
        },
        error: () => this.driversLoading.set(false),
      });
  }

  protected assignDriver(): void {
    const driverId = this.selectedDriverId();
    const tripRequestId = this.tripId();
    if (!driverId || !tripRequestId || this.assignLoading()) return;

    this.assignLoading.set(true);
    this.tripDetailsService.assignDriver(tripRequestId, driverId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.assignLoading.set(false);
          this.selectedDriverId.set('');
          this.notifications.showSuccess('Driver assigned successfully.');
          this.loadTripDetails(tripRequestId);
        },
        error: () => this.assignLoading.set(false),
      });
  }

  protected acceptTrip(): void {
    const tripRequestId = this.tripId();
    if (!tripRequestId || this.actionLoading()) return;

    this.actionLoading.set(true);
    this.tripDetailsService.acceptTrip(tripRequestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.showSuccess('Trip accepted successfully.');
          this.loadTripDetails(tripRequestId);
          this.actionLoading.set(false);
        },
        error: () => this.actionLoading.set(false),
      });
  }

  protected markArrived(): void {
    const tripRequestId = this.tripId();
    if (!tripRequestId || this.actionLoading()) return;

    this.actionLoading.set(true);
    this.tripDetailsService.markArrived(tripRequestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.showSuccess('Arrival marked successfully.');
          this.loadTripDetails(tripRequestId);
          this.actionLoading.set(false);
        },
        error: () => this.actionLoading.set(false),
      });
  }

  protected startTrip(): void {
    const tripRequestId = this.tripId();
    if (!tripRequestId || this.actionLoading()) return;

    this.actionLoading.set(true);
    this.tripDetailsService.startTrip(tripRequestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.showSuccess('Trip started successfully.');
          this.loadTripDetails(tripRequestId);
          this.actionLoading.set(false);
        },
        error: () => this.actionLoading.set(false),
      });
  }

  protected completeTrip(): void {
    const tripRequestId = this.tripId();
    if (!tripRequestId || this.actionLoading()) return;

    this.actionLoading.set(true);
    this.tripDetailsService.completeTrip(tripRequestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.showSuccess('Trip completed successfully.');
          this.loadTripDetails(tripRequestId);
          this.actionLoading.set(false);
        },
        error: () => this.actionLoading.set(false),
      });
  }

  protected cancelTrip(): void {
    const tripRequestId = this.tripId();
    if (!tripRequestId || this.actionLoading()) return;

    this.actionLoading.set(true);
    this.tripDetailsService.cancelTrip(tripRequestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notifications.showSuccess('Trip cancelled successfully.');
          this.loadTripDetails(tripRequestId);
          this.actionLoading.set(false);
        },
        error: () => this.actionLoading.set(false),
      });
  }

  protected endTrip(): void {
    this.completeTrip();
  }

  protected formatDateOnly(value: string | undefined): string {
    if (!value) return '--';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  protected formatMoney(value: number | undefined): string {
    if (value === undefined || Number.isNaN(value)) return '--';
    return value.toFixed(2);
  }

  private calculateHotelProfit(fare: number, commission: number | null | undefined): number {
    return fare * this.toCommissionMultiplier(commission ?? this.commissionPercentage());
  }

  private toCommissionMultiplier(value: number): number {
    return value > 1 ? value / 100 : value;
  }

  private normalizeStatus(status: string | null | undefined): string {
    return status?.trim().toLowerCase() ?? '';
  }

  private isScheduledStatus(status: string | null | undefined): boolean {
    status = this.normalizeStatus(status);
    return status === 'scheduled' || status === 'schedualed';
  }

  private isCancelledStatus(status: string | null | undefined): boolean {
    return this.normalizeStatus(status).includes('cancel');
  }

  private isCompletedStatus(status: string | null | undefined): boolean {
    return this.normalizeStatus(status).includes('complete');
  }

  private resolveEffectiveStatus(data: TripDetailsResponse): string {
    const statuses = [
      data.tripStatusString,
      data.tripRequestStatusString,
      data.requestStatusString,
      data.unifiedStatus,
    ].map(status => this.normalizeStatus(status ?? ''));

    return statuses.find(status => this.isCompletedStatus(status) || this.isCancelledStatus(status)) ??
      statuses.find(Boolean) ??
      '';
  }

  private isTripFinished(): boolean {
    const status = this.trip()?.status;
    return status === 'completed' || status === 'cancelled';
  }

  private cleanId(value: string | null | undefined): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private cleanText(value: string | null | undefined): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  onHotelDelete(): void {}
}
