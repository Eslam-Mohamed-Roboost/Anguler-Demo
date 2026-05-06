import { Component, output } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-chat-input',
  imports: [TranslatePipe],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.css',
})
export class ChatInputComponent {
  readonly send = output<string>();
  readonly mention = output<void>();
  readonly attach = output<void>();
  readonly addImage = output<void>();

  protected onSend(input: HTMLInputElement): void {
    const text = input.value.trim();
    if (text) {
      this.send.emit(text);
      input.value = '';
    }
  }
}
