import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { HotelInfo } from '../../types/hotel-details.types';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { ModalComponent } from "../../../../shared/components/modal/modal.component";
import { HotelDetailsService } from '../../services/hotel-details.service';

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
  readonly showConfirmBlockModal = signal(false);
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
  ToggleBlockhotel(): void {
  this.hotelService.blockToggle(this.hotel().id).subscribe({
    next: (result) => {
      if (result.isSuccess && result.data !== undefined) {
         this.hotel().isBlocked = !this.hotel().isBlocked;
      }
    },
    error: (err) => {
      console.error('Error toggling block status:', err);
    }
  });
    this.closeConfirmBlockModal();
  }
 
}
