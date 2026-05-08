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
import { ActivatedRoute, RouterLink } from '@angular/router';
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

export interface TripDetail {
  tripId: string;
  tripCode?: string;
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
}

@Component({
  selector: 'app-hotel-trip-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
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
  private readonly renderer = inject(Renderer2);
  private readonly hotelDetailsService = inject(HotelDetailsService);
  private readonly tripDetailsService = inject(TripDetailsService);
  private readonly authService = inject(AuthService);
  private readonly hotelRequestsService = inject(HotelRequestsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notifications = inject(NotificationStore);

  readonly isAdmin = computed(() => this.authService.hasRole('admin'));

  readonly hotelId = signal('');
  readonly tripId = signal('');
  readonly hotelLoading = signal(false);
  readonly tripLoading = signal(false);

  // Assign driver
  readonly drivers = signal<DriverItem[]>([]);
  readonly driversLoading = signal(false);
  readonly selectedDriverId = signal('');
  readonly assignLoading = signal(false);
  readonly rawStatus = signal('');
  readonly actionLoading = signal(false);

  readonly hotel = signal<HotelInfo>({
    id: '',
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
      active: 'text-status-scheduled bg-status-scheduled-bg',
      pending: 'text-status-scheduled bg-status-scheduled-bg',
      completed: 'text-status-completed bg-status-completed-bg',
      cancelled: 'text-status-cancelled bg-status-cancelled-bg',
      scheduled: 'text-status-active bg-status-active-bg',
    };
    return map[status] ?? '';
  });

  readonly canAccept = computed(() => {
    const status = this.rawStatus().toLowerCase();
    return status === 'pending';
  });

  readonly canMarkArrived = computed(() => {
    const status = this.rawStatus().toLowerCase();
    return status === 'accepted' || status === 'inprogress' || status === 'arrived';
  });

  readonly canStartTrip = computed(() => {
    const status = this.rawStatus().toLowerCase();
    return status === 'accepted' || status === 'inprogress' || status === 'arrived';
  });

  readonly canCompleteTrip = computed(() => {
    const status = this.rawStatus().toLowerCase();
    return status === 'accepted' || status === 'inprogress' || status === 'arrived';
  });

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'hotel-details-active');
    const hotelId = this.route.snapshot.paramMap.get('id');
    const tripId = this.route.snapshot.paramMap.get('tripId');
    if (tripId) {
      this.tripId.set(tripId);
      this.loadTripDetails(tripId);
    }
    if (hotelId) {
      this.hotelId.set(hotelId);
      this.loadHotelById(hotelId);
    } else {
      this.loadHotelProfile();
    }
  }

  private loadHotelById(hotelId: string): void {
    this.hotelLoading.set(true);
    this.hotelDetailsService.getHotelById(hotelId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.hotelLoading.set(false);
          if (result.isSuccess && result.data) {
            const h = result.data;
            this.hotel.set({
              id: h.id,
              name: h.hotelName,
              address: h.address,
              phone: h.phoneNumber,
              email: h.email,
              imageUrl: h.logoUrl ?? '',
              isBlocked: h.isBlocked ?? false,
            });
          }
        },
        error: () => { this.hotelLoading.set(false); },
      });
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'hotel-details-active');
  }

  private loadHotelProfile(): void {
    this.hotelLoading.set(true);
    this.hotelDetailsService.getMyProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.hotelLoading.set(false);
          if (result.isSuccess && result.data) {
            const p = result.data;
            this.hotelId.set(p.hotelId);
            this.hotel.set({
              id: p.hotelId,
              name: p.hotelName,
              address: p.address,
              phone: p.phoneNumber,
              email: p.email,
              isBlocked: p.isBlocked ?? false,
              imageUrl: p.imageUrl ?? '',
            });
          }
        },
        error: () => { this.hotelLoading.set(false); },
      });
  }

  private loadTripDetails(tripRequestId: string): void {
    this.tripLoading.set(true);
    this.tripDetailsService.getTripByRequestId(tripRequestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.tripLoading.set(false);
          if (result.isSuccess && result.data) {
            console.log('Trip status:', result.data.unifiedStatus);
            this.rawStatus.set(result.data.unifiedStatus);
            this.trip.set(this.toTripDetail(result.data));
            if (this.isAdmin() && result.data.unifiedStatus === 'Pending') {
              this.loadDrivers();
            }
          }
        },
        error: () => { this.tripLoading.set(false); },
      });
  }

  private toTripDetail(data: TripDetailsResponse): TripDetail {
    const statusMap: Record<string, TripDetail['status']> = {
      pending: 'pending',
      accepted: 'active',
      arrived: 'active',
      inprogress: 'active',
      completed: 'completed',
      cancelled: 'cancelled',
      rejected: 'cancelled',
      scheduled: 'scheduled',
    };

    return {
      tripId: data.tripCode ?? data.tripRequestId,
      guestName: data.guestName,
      roomNo: String(data.roomNumber),
      destinations: data.endLocation.address,
      fare: data.actualFare ?? data.estimatedPrice,
      hotelProfits: 0,
      commissionRate: 0,
      startDate: data.startedAt ?? data.requestedAt,
      endDate: data.endedAt ?? undefined,
      tripRate: undefined,
      status: statusMap[data.unifiedStatus.toLowerCase()] ?? 'pending',
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

  onHotelDelete(): void {}
}
