import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { HotelInfo } from '../../types/hotel-details.types';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-hotel-info-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, IconComponent],
  templateUrl: './hotel-info-card.component.html',
  styleUrl: './hotel-info-card.component.css',
})
export class HotelInfoCardComponent {
  readonly hotel = input.required<HotelInfo>();
  readonly deleteClick = output<void>();

  protected readonly contactInfo = computed(() => {
    const hotel = this.hotel();
    return [
      { icon: 'map-pin' as const, text: hotel.address },
      { icon: 'phone' as const, text: hotel.phone },
      { icon: 'mail' as const, text: hotel.email },
    ];
  });
}
