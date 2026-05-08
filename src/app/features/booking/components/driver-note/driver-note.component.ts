import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-driver-note',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  templateUrl: './driver-note.component.html',
  styleUrl: './driver-note.component.css',
})
export class DriverNoteComponent {
  readonly isChecked = model(false);
  readonly noteText = model('');

  toggleCheckbox(): void {
    this.isChecked.set(!this.isChecked());
  }

  onNoteChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.noteText.set(textarea.value);
  }
}
