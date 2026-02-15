import { Component } from '@angular/core';
import { MessageComponent } from "../message/message.component";

@Component({
  selector: 'app-chat',
  imports: [MessageComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {

}
