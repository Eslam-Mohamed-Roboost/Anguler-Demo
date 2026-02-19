import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { DirectionSliderComponent, Direction } from './direction-slider.component';
import { InputComponent } from '../input/input.component';
import { form } from '@angular/forms/signals';

@Component({
  selector: 'app-direction-slider-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DirectionSliderComponent, InputComponent],
  templateUrl: './direction-slider-demo.component.html',
  styleUrl: './direction-slider-demo.component.css',
})
export class DirectionSliderDemoComponent {
  /** Current text direction */
  readonly textDirection = signal<Direction>('ltr');

  /** Form data */
  readonly formData = signal({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  /** Form fields */
  readonly formFields = form(this.formData);

  /** Handle direction change */
  onDirectionChange(direction: Direction): void {
    this.textDirection.set(direction);
  }

  /** Get current direction class */
  protected readonly directionClass = computed(() => ({
    'ltr-layout': this.textDirection() === 'ltr',
    'rtl-layout': this.textDirection() === 'rtl',
  }));
}
