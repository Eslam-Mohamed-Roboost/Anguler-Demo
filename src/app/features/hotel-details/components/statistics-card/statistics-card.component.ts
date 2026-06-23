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

  protected readonly iconClass = computed(() => {
    switch (this.statistic().color) {
      case 'green':
        return 'bg-status-completed-bg text-status-completed';
      case 'red':
        return 'bg-status-cancelled-bg text-status-cancelled';
      case 'blue':
      case 'indigo':
        return 'bg-blue-light text-blue';
      case 'purple':
        return 'bg-purple-light text-purple';
      case 'yellow':
      case 'orange':
      default:
        return 'bg-status-scheduled-bg text-status-scheduled';
    }
  });

  protected readonly formatValue = computed(() => {
    const value = this.statistic().value;
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  });
}
