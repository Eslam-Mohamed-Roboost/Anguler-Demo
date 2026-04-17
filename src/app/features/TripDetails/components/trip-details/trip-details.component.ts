import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TripDetailsService } from '../../services/trip-details.service';
import type { HotelInfo, TripDetailsResponse } from '../../models/trip-details.model';
import { DetailsComponent } from '../details/details.component';
import { ChatComponent } from '../chat/chat.component';
import { SkeletonBlockComponent } from '../../../../shared/components/skeleton/skeleton-block.component';
import { BaseComponent } from '../../../../shared/base/base.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-trip-details',
  imports: [DetailsComponent, ChatComponent, SkeletonBlockComponent],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripDetailsComponent extends BaseComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tripDetailsService = inject(TripDetailsService);
  private readonly authService = inject(AuthService);

  protected readonly isAdmin = computed(() => this.authService.hasRole('admin'));
  protected readonly tripRequestId = signal('');
  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly tripData = signal<TripDetailsResponse | null>(null);
  protected readonly hotelInfo = signal<HotelInfo | null>(null);

  ngOnInit(): void {
    this.route.paramMap.pipe(this.takeUntilDestroyed()).subscribe(params => {
      const id = params.get('id') ?? '';
      this.tripRequestId.set(id);
      if (id) {
        this.loadTrip(id);
      }
    });
  }

  private loadTrip(id: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.hotelInfo.set(null);
    this.tripDetailsService.getTripByRequestId(id).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.tripData.set(result.data);
          if (result.data.hotelId) {
            this.loadHotel(result.data.hotelId);
          }
        } else {
          this.error.set(true);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private loadHotel(hotelId: string): void {
    this.tripDetailsService.getHotelById(hotelId).pipe(this.takeUntilDestroyed()).subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.hotelInfo.set(result.data);
        }
      },
      error: () => {},
    });
  }

  protected refreshTrip(): void {
    const id = this.tripRequestId();
    if (id) {
      this.loadTrip(id);
    }
  }
}
