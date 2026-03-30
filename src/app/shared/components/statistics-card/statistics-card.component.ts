import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { IconComponent, type IconName } from '../icon/icon.component';
import { CardComponent } from '../card/card.component';

type StatColor = 'green' | 'orange' | 'red' | 'blue' | 'purple' | 'yellow' | 'indigo';

const ICON_BG: Record<StatColor, string> = {
  green: 'bg-emerald-50 text-emerald-500',
  orange: 'bg-orange-50 text-orange-400',
  red: 'bg-red-50 text-red-500',
  blue: 'bg-blue-50 text-blue-500',
  purple: 'bg-purple-50 text-purple-500',
  yellow: 'bg-yellow-50 text-yellow-500',
  indigo: 'bg-indigo-50 text-indigo-500',
};

@Component({
  selector: 'app-statistics-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, IconComponent],
  templateUrl: './statistics-card.component.html',
  styleUrl: './statistics-card.component.css',
})
export class StatisticsCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input<IconName>('users');
  readonly color = input<StatColor>('orange');
  readonly changePercent = input<number | null>(null);
  readonly changeDescription = input<string>('');

  protected readonly formattedValue = computed(() => {
    const v = this.value();
    return typeof v === 'number' ? v.toLocaleString() : v;
  });

  protected readonly iconClasses = computed(() => ICON_BG[this.color()] ?? ICON_BG['orange']);

  protected readonly changeText = computed(() => {
    const pct = this.changePercent();
    if (pct == null) return '';
    if (pct === 0) return 'No change';
    const desc = this.changeDescription();
    return desc ? `${pct}% ${desc}` : `${pct}%`;
  });

  protected readonly changeColor = computed(() => {
    const pct = this.changePercent();
    if (pct == null || pct === 0) return 'text-gray-800';
    return pct > 0 ? 'text-emerald-500' : 'text-red-500';
  });
}
