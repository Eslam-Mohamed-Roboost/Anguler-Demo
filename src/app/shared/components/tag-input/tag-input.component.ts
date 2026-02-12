/**
 * Multi-value tag/chip input — users type a value and press Enter or comma
 * to add it as a tag. Tags can be removed individually.
 *
 * Usage:
 *   <app-tag-input
 *     label="Tags"
 *     inputId="product-tags"
 *     [tags]="tags()"
 *     (tagsChange)="tags.set($event)"
 *     placeholder="Add a tag..."
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
  selector: 'app-tag-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './tag-input.component.html',
  styleUrl: './tag-input.component.css',
})
export class TagInputComponent {
  /** Label text */
  readonly label = input('');

  /** Unique HTML id */
  readonly inputId = input.required<string>();

  /** Current list of tags */
  readonly tags = input<string[]>([]);

  /** Emitted when the tag list changes */
  readonly tagsChange = output<string[]>();

  /** Placeholder text */
  readonly placeholder = input('Add a tag...');

  /** Maximum number of tags (0 = unlimited) */
  readonly maxTags = input(0);

  /** Whether duplicate tags are allowed */
  readonly allowDuplicates = input(false);

  protected readonly inputValue = signal('');

  protected onKeyDown(event: KeyboardEvent): void {
    const value = this.inputValue().trim();

    if ((event.key === 'Enter' || event.key === ',') && value) {
      event.preventDefault();
      this.addTag(value);
    }

    if (event.key === 'Backspace' && !this.inputValue() && this.tags().length > 0) {
      this.removeTag(this.tags().length - 1);
    }
  }

  protected onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    // If they typed a comma, split and add
    if (val.includes(',')) {
      const parts = val.split(',').map((p) => p.trim()).filter(Boolean);
      for (const part of parts) {
        this.addTag(part);
      }
      this.inputValue.set('');
      return;
    }
    this.inputValue.set(val);
  }

  protected removeTag(index: number): void {
    const updated = [...this.tags()];
    updated.splice(index, 1);
    this.tagsChange.emit(updated);
  }

  protected get isAtMax(): boolean {
    return this.maxTags() > 0 && this.tags().length >= this.maxTags();
  }

  private addTag(value: string): void {
    if (this.isAtMax) return;
    if (!this.allowDuplicates() && this.tags().includes(value)) return;

    this.tagsChange.emit([...this.tags(), value]);
    this.inputValue.set('');
  }
}
