import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import type { TripDetailsResponse } from '../../models/trip-details.model';

@Component({
  selector: 'app-trip-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, IconComponent, TranslatePipe],
  templateUrl: './trip-banner.component.html',
  styleUrl: './trip-banner.component.css',
  host: {
    '(document:keydown.escape)': 'hideTripCodeInfo()',
  },
})
export class TripBannerComponent {
  readonly data = input.required<TripDetailsResponse>();

  protected readonly showTripCodeInfo = signal(false);
  protected readonly avatarFailed = signal(false);
  protected readonly driver = computed(() => this.data().driver);
  protected readonly driverInitial = computed(() => this.driver()?.fullName?.trim().charAt(0).toUpperCase() || '?');
  protected readonly driverRating = computed(() => this.driver()?.rating ?? '--');
  protected readonly arrivalTime = computed(() => {
    const trip = this.data();
    if (!trip.driver || trip.arrivedAt || trip.startedAt || trip.endedAt) return '--';
    return this.formatMinutes(trip.estimatedArrivalMinutes);
  });
  protected readonly tripTime = computed(() => this.formatMinutes(this.data().durationMinutes));
  protected readonly carNumber = computed(() => this.data().vehiclePlateNumber?.trim() || '--');
  protected readonly tripCode = computed(() => this.data().tripCode?.trim() || '--');

  protected toggleTripCodeInfo(): void {
    this.showTripCodeInfo.update(show => !show);
  }

  protected hideTripCodeInfo(): void {
    this.showTripCodeInfo.set(false);
  }

  private formatMinutes(minutes: number | null | undefined): string {
    if (minutes == null || Number.isNaN(minutes)) return '--';
    const totalSeconds = Math.max(0, Math.round(minutes * 60));
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor((totalSeconds % 3600) / 60))}:${pad(totalSeconds % 60)}`;
  }
}
