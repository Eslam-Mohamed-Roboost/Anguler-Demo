import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { getTripStatusLabel, getTripStatusVariant, HotelInfo, TripDetailsResponse } from '../../models/trip-details.model';
import { TripDetailsService } from '../../services/trip-details.service';
import { HotelRequestsService, type DriverItem } from '../../../admin-dashboard/services/hotel-requests.service';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import type { TranslationKey } from '../../../../core/i18n/translations';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, IconComponent, TranslatePipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  private readonly tripDetailsService = inject(TripDetailsService);
  private readonly hotelRequestsService = inject(HotelRequestsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notifications = inject(NotificationStore);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);

  readonly data = input.required<TripDetailsResponse>();
  readonly tripRequestId = input.required<string>();
  readonly hotelInfo = input<HotelInfo | null>(null);
  readonly isAdmin = input<boolean>(false);

  readonly statusChanged = output<void>();

  protected readonly statusLabel = computed(() => {
    const trip = this.data();
    if (trip.isScheduled && !trip.startedAt && !this.isFinishedTrip(trip) && !trip.endedAt) {
      return 'Scheduled';
    }

    const effectiveStatus = this.resolveEffectiveStatus(trip);
    if (this.isCompletedStatus(effectiveStatus)) return 'Completed';
    if (this.isCancelledStatus(effectiveStatus)) return 'Cancelled';

    return getTripStatusLabel(trip.unifiedStatus);
  });
  protected readonly statusLabelKey = computed(() => this.statusTranslationKey(this.statusLabel()));
  protected readonly statusVariant = computed(() => getTripStatusVariant(this.statusLabel()));
  protected readonly hotelProfit = computed(() => {
    const trip = this.data();
    const fare = trip.actualFare ?? trip.estimatedPrice;
    const commission = trip.commission;

    if (commission == null || Number.isNaN(fare)) {
      return undefined;
    }

    return fare * this.toCommissionMultiplier(commission);
  });
  protected readonly canAssignDriver = computed(() =>
    this.isAdmin() &&
    !this.data().driver &&
    !this.isFinishedTrip(this.data()) &&
    (this.isPendingStatus(this.data().unifiedStatus) || this.isScheduledStatus(this.data().unifiedStatus))
  );
  protected readonly canShowScheduledActions = computed(() =>
    this.data().isScheduled &&
    !this.data().startedAt &&
    !this.data().endedAt &&
    !this.isFinishedTrip(this.data())
  );
  protected readonly canShowStatusActions = computed(() =>
    this.isAdmin() &&
    !this.data().endedAt &&
    !this.isFinishedTrip(this.data()) &&
    (this.data().unifiedStatus === 'Accepted' || this.data().unifiedStatus === 'Arrived' || this.data().unifiedStatus === 'InProgress')
  );

  protected readonly actionLoading = signal(false);
  protected readonly showScheduledMenu = signal(false);
  protected readonly cancelLoading = signal(false);

  // Assign driver
  protected readonly drivers = signal<DriverItem[]>([]);
  protected readonly driversLoading = signal(false);
  protected readonly selectedDriverId = signal('');
  protected readonly assignLoading = signal(false);

  ngOnInit(): void {
    if (this.canAssignDriver()) {
      this.loadDrivers();
    }
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
    const tripRequestId = this.tripRequestId();
    if (!driverId || !tripRequestId || this.assignLoading()) return;

    this.assignLoading.set(true);
    this.tripDetailsService.assignDriver(tripRequestId, driverId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.assignLoading.set(false);
          this.selectedDriverId.set('');
          this.notifications.showSuccess('Driver assigned successfully.');
          this.statusChanged.emit();
        },
        error: () => this.assignLoading.set(false),
      });
  }

  protected triggerStatusAction(): void {
    const id = this.tripRequestId();
    const status = this.data().unifiedStatus;
    if (!id || this.actionLoading()) return;

    const action =
      status === 'Accepted' ? this.tripDetailsService.markArrived(id) :
      status === 'Arrived' ? this.tripDetailsService.startTrip(id) :
      status === 'InProgress' ? this.tripDetailsService.completeTrip(id) :
      null;

    if (!action) return;

    this.actionLoading.set(true);
    action.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.statusChanged.emit();
      },
      error: () => this.actionLoading.set(false),
    });
  }

  protected toggleScheduledMenu(): void {
    this.showScheduledMenu.update(open => !open);
  }

  protected closeScheduledMenu(): void {
    this.showScheduledMenu.set(false);
  }

  protected openRescheduleModal(): void {
    this.closeScheduledMenu();
    this.router.navigate(['/home'], {
      queryParams: {
        rescheduleTripRequestId: this.tripRequestId(),
        scheduledAt: this.data().scheduledAt,
      },
    });
  }

  protected cancelTrip(): void {
    const tripRequestId = this.tripRequestId();
    if (!tripRequestId || this.cancelLoading()) return;

    this.closeScheduledMenu();
    this.cancelLoading.set(true);
    this.tripDetailsService.cancelTrip(tripRequestId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.cancelLoading.set(false);
          if (result.isSuccess) {
            this.notifications.showSuccess(this.language.translate('tripDetails.cancelSuccess'));
            this.statusChanged.emit();
          } else {
            this.notifications.showError(result.error?.description ?? this.language.translate('tripDetails.cancelError'));
          }
        },
        error: () => {
          this.cancelLoading.set(false);
          this.notifications.showError(this.language.translate('tripDetails.cancelError'));
        },
      });
  }

  protected formatScheduledAt(value: string | null): string {
    if (!value) return '--';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(value));
  }

  protected formatDateTime(value: string | null): string {
    if (!value) return '--';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(value));
  }

  protected formatMoney(value: number | undefined): string {
    if (value === undefined || Number.isNaN(value)) return '--';
    return value.toFixed(2);
  }

  private statusTranslationKey(status: string): TranslationKey {
    return `tripDetails.status.${status.replace(/\s+/g, '')}` as TranslationKey;
  }

  private isCancelledStatus(status: string): boolean {
    return status.toLowerCase().includes('cancel');
  }

  private toCommissionMultiplier(value: number): number {
    return value > 1 ? value / 100 : value;
  }

  private isCompletedStatus(status: string): boolean {
    return status.toLowerCase().includes('complete');
  }

  private isFinishedStatus(status: string): boolean {
    const normalized = status.trim().toLowerCase();
    return this.isCompletedStatus(normalized) || this.isCancelledStatus(normalized) || normalized === 'rejected';
  }

  private isFinishedTrip(trip: TripDetailsResponse): boolean {
    return !!trip.endedAt || this.isFinishedStatus(this.resolveEffectiveStatus(trip));
  }

  private resolveEffectiveStatus(trip: TripDetailsResponse): string {
    const statuses = [
      trip.tripStatusString,
      trip.tripRequestStatusString,
      trip.requestStatusString,
      trip.unifiedStatus,
    ].map(status => status?.trim().toLowerCase() ?? '');

    return statuses.find(status => this.isCompletedStatus(status) || this.isCancelledStatus(status)) ??
      statuses.find(Boolean) ??
      '';
  }

  private isPendingStatus(status: string): boolean {
    return status.trim().toLowerCase() === 'pending';
  }

  private isScheduledStatus(status: string): boolean {
    const normalized = status.trim().toLowerCase();
    return normalized === 'scheduled' || normalized === 'schedualed';
  }
}
