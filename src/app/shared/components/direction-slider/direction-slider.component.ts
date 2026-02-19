import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export type Direction = 'ltr' | 'rtl';

@Component({
  selector: 'app-direction-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './direction-slider.component.html',
  styleUrl: './direction-slider.component.css',
})
export class DirectionSliderComponent {
  /** Current direction */
  readonly direction = input<Direction>('ltr');

  /** Emits when direction changes */
  readonly directionChange = output<Direction>();

  /** Available directions */
  readonly directions: { value: Direction; label: string; icon: string }[] = [
    { value: 'ltr', label: 'Left to Right', icon: 'arrow-left' },
    { value: 'rtl', label: 'Right to Left', icon: 'arrow-right' },
  ];

  /** Toggle direction */
  toggleDirection(): void {
    const newDirection = this.direction() === 'ltr' ? 'rtl' : 'ltr';
    this.directionChange.emit(newDirection);
  }

  /** Set specific direction */
  setDirection(newDirection: Direction): void {
    if (newDirection !== this.direction()) {
      this.directionChange.emit(newDirection);
    }
  }

  /** Get current direction info */
  protected readonly currentDirectionInfo = computed(() => 
    this.directions.find(d => d.value === this.direction())
  );
}
