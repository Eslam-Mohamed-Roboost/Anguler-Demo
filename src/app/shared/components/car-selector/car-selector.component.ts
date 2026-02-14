import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  model,
} from '@angular/core';

export interface CarOption {
  id: string;
  label: string;
  image: string;
}

@Component({
  selector: 'app-car-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './car-selector.component.html',
  styleUrl: './car-selector.component.css',
})
export class CarSelectorComponent {
  /** List of car options to display */
  readonly options = input.required<readonly CarOption[]>();

  /** Currently selected car id (two-way binding) */
  readonly selected = model<string>('');

  /** Label displayed above the car grid */
  readonly label = input('');

  selectCar(id: string): void {
    this.selected.set(id);
  }
}
