import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
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
  readonly isChecked = input(false);
  readonly noteText = input('');

  readonly checkedChange = output<boolean>();
  readonly noteChange = output<string>();

  toggleCheckbox(): void {
    this.checkedChange.emit(!this.isChecked());
  }

  onNoteChange(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.noteChange.emit(textarea.value);
  }
}
