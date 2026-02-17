import { Component, output } from '@angular/core';

@Component({
  selector: 'app-chat-input',
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
