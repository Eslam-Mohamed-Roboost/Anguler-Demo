import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { HotelInfo } from '../../types/hotel-details.types';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { ModalComponent } from "../../../../shared/components/modal/modal.component";
import { HotelDetailsService } from '../../services/hotel-details.service';
import { NotificationStore } from '../../../../core/stores/notification.store';

@Component({
  selector: 'app-hotel-info-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, IconComponent, TranslatePipe, ModalComponent],
  templateUrl: './hotel-info-card.component.html',
  styleUrl: './hotel-info-card.component.css',
})
export class HotelInfoCardComponent {
  readonly hotel = input.required<HotelInfo>();
  readonly deleteClick = output<void>();
  private readonly hotelService = inject(HotelDetailsService);
  private readonly notifications = inject(NotificationStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly showConfirmBlockModal = signal(false);
  readonly toggleLoading = signal(false);

  closeConfirmBlockModal(): void {
    this.showConfirmBlockModal.set(false);
  }

  protected readonly contactInfo = computed(() => {
    const hotel = this.hotel();
    return [
      { icon: 'map-pin' as const, text: hotel.address },
      { icon: 'phone' as const, text: hotel.phone },
      { icon: 'mail' as const, text: hotel.email },
    ];
  });

  protected onBlockClick(): void {
    this.showConfirmBlockModal.set(true);
  }

  toggleBlockHotel(): void {
    const hotelId = this.hotel().id;
    this.toggleLoading.set(true);

    this.hotelService
      .toggleBlockHotel(hotelId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.toggleLoading.set(false);
          if (result.isSuccess) {
            this.hotel().isBlocked = !this.hotel().isBlocked;
            const message = this.hotel().isBlocked
              ? 'Hotel blocked successfully.'
              : 'Hotel unblocked successfully.';
            this.notifications.showSuccess(message);
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to toggle hotel status.');
          }
          this.closeConfirmBlockModal();
        },
        error: () => {
          this.toggleLoading.set(false);
          this.notifications.showError('Failed to toggle hotel status.');
          this.closeConfirmBlockModal();
        },
      });
  }
}
