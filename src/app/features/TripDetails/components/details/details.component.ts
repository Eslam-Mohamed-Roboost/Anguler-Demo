import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { getTripStatusLabel, getTripStatusVariant, HotelInfo, TripDetailsResponse } from '../../models/trip-details.model';
import { TripDetailsService } from '../../services/trip-details.service';
import { FeedbackService } from '../../services/feedback.service';
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
  private readonly feedbackService = inject(FeedbackService);
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

  protected readonly statusLabel = computed(() => getTripStatusLabel(this.data().unifiedStatus));
  protected readonly statusLabelKey = computed(() => this.statusTranslationKey(this.statusLabel()));
  protected readonly statusVariant = computed(() => getTripStatusVariant(this.data().unifiedStatus));
  protected readonly canShowScheduledActions = computed(() =>
    this.data().isScheduled && !this.isCancelledStatus(this.data().unifiedStatus)
  );

  protected readonly actionLoading = signal(false);
  protected readonly showScheduledMenu = signal(false);
  protected readonly cancelLoading = signal(false);
  protected readonly feedbackRating = signal(0);
  protected readonly feedbackComment = signal('');
  protected readonly feedbackLoading = signal(false);
  protected readonly feedbackSubmitted = signal(false);

  // Assign driver
  protected readonly drivers = signal<DriverItem[]>([]);
  protected readonly driversLoading = signal(false);
  protected readonly selectedDriverId = signal('');
  protected readonly assignLoading = signal(false);

  ngOnInit(): void {
    if (this.isAdmin() && this.data().unifiedStatus === 'Pending') {
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

  protected submitFeedback(): void {
    const tripId = this.data().tripId;
    const rating = this.feedbackRating();
    if (!tripId || rating === 0 || this.feedbackLoading()) return;

    this.feedbackLoading.set(true);
    this.feedbackService.submitFeedback(tripId, rating, this.feedbackComment())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.feedbackLoading.set(false);
          this.feedbackSubmitted.set(true);
        },
        error: () => this.feedbackLoading.set(false),
      });
  }

  protected setRating(stars: number): void {
    this.feedbackRating.set(stars);
  }

  protected ratingUnitKey(stars: number): TranslationKey {
    return stars === 1 ? 'tripDetails.ratingStar' : 'tripDetails.ratingStars';
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

  private statusTranslationKey(status: string): TranslationKey {
    return `tripDetails.status.${status.replace(/\s+/g, '')}` as TranslationKey;
  }

  private isCancelledStatus(status: string): boolean {
    return status.toLowerCase().includes('cancel');
  }

  protected readonly stars = [1, 2, 3, 4, 5];
}
