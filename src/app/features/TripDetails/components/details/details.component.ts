import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { getTripStatusLabel, getTripStatusVariant, HotelInfo, TripDetailsResponse } from '../../models/trip-details.model';
import { TripDetailsService } from '../../services/trip-details.service';
import { FeedbackService } from '../../services/feedback.service';
import { HotelRequestsService, type DriverItem } from '../../../admin-dashboard/services/hotel-requests.service';
import { NotificationStore } from '../../../../core/stores/notification.store';

@Component({
  selector: 'app-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, IconComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  private readonly tripDetailsService = inject(TripDetailsService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly hotelRequestsService = inject(HotelRequestsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notifications = inject(NotificationStore);

  readonly data = input.required<TripDetailsResponse>();
  readonly tripRequestId = input.required<string>();
  readonly hotelInfo = input<HotelInfo | null>(null);
  readonly isAdmin = input<boolean>(false);

  readonly statusChanged = output<void>();

  protected readonly statusLabel = computed(() => getTripStatusLabel(this.data().unifiedStatus));
  protected readonly statusVariant = computed(() => getTripStatusVariant(this.data().unifiedStatus));

  protected readonly actionLoading = signal(false);
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

  protected readonly stars = [1, 2, 3, 4, 5];
}
