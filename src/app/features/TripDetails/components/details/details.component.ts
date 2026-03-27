import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import {
  PersonCard,
  TripDetailsInfo,
  getTripStatusLabel,
  getTripStatusVariant,
} from '../../models/trip-details.model';

@Component({
  selector: 'app-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, IconComponent, TranslatePipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent {
  readonly passengerCard = input.required<PersonCard>();
  readonly driverCard = input.required<PersonCard>();
  readonly tripDetails = input.required<TripDetailsInfo>();

  protected readonly statusLabel = computed(() => getTripStatusLabel(this.tripDetails().tripStatus));
  protected readonly statusVariant = computed(() => getTripStatusVariant(this.tripDetails().tripStatus));
  protected readonly destinations = computed(() => this.tripDetails().destinations.join(' → '));
}
