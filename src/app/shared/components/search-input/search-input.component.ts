/**
 * Shared debounced search input — emits filtered query after a configurable delay.
 *
 * Usage:
 *   <app-search-input
 *     placeholder="Search products..."
 *     [debounceMs]="300"
 *     (searchChange)="onSearch($event)"
 *   />
 */
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-search-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.css',
})
export class SearchInputComponent {
  readonly placeholder = input('Search...');
  readonly debounceMs = input(300);
  readonly searchChange = output<string>();

  protected readonly query = signal('');
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.searchChange.emit(value);
    }, this.debounceMs());
  }

  clear(): void {
    this.query.set('');
    this.searchChange.emit('');
  }
}
