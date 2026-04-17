import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';

export interface CarOption {
  id: string;
  label: string;
  image: string;
  price?: number;
  estimatedMinutes?: number;
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

  /** Show skeleton placeholders instead of real options */
  readonly loading = input(false);

  /** Number of skeleton placeholder cards to show while loading */
  readonly skeletonCount = input(6);

  readonly skeletonItems = computed(() => Array.from({ length: this.skeletonCount() }));

  selectCar(id: string): void {
    this.selected.set(id);
  }
}
