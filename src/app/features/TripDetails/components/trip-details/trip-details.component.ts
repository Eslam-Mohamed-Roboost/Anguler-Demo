import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../../../shared/base/base.component';
import { TripDetailsService } from '../../services/trip-details.service';
import { ResultHandlerService } from '../../../../core/services/result-handler.service';
import { TripDetailsResponse } from '../../models/trip-details.model';
import { DetailsComponent } from '../details/details.component';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-trip-details',
  imports: [DetailsComponent, ChatComponent],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripDetailsComponent extends BaseComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tripDetailsService = inject(TripDetailsService);
  private readonly resultHandler = inject(ResultHandlerService);

  protected readonly tripData = signal<TripDetailsResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  ngOnInit(): void {
    const tripId = this.route.snapshot.paramMap.get('id');
    if (tripId) {
      this.loadTripDetails(tripId);
    }
  }

  private loadTripDetails(tripId: string): void {
    this.loading.set(true);
    this.error.set(false);

    this.tripDetailsService
      .getTripDetails(tripId)
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (result) => {
          this.resultHandler.handleResult(
            result,
            (data) => this.tripData.set(data),
            () => this.error.set(true),
          );
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
}
