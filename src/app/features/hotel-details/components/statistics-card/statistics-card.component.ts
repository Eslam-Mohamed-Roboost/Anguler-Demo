import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

export interface StatisticItem {
  label: string;
  value: string | number;
  color?: 'green' | 'orange' | 'red' | 'blue' | 'purple' | 'yellow' | 'indigo';
}

@Component({
  selector: 'app-statistics-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, IconComponent, TranslatePipe],
  templateUrl: './statistics-card.component.html',
  styleUrl: './statistics-card.component.css',
})
export class StatisticsCardComponent {
  readonly statistic = input.required<StatisticItem>();

  protected readonly formatValue = computed(() => {
    const value = this.statistic().value;
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  });
}
