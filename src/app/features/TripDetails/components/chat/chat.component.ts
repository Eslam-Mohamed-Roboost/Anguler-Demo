import { Component } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { MessageComponent } from "../message/message.component";

@Component({
  selector: 'app-chat',
  imports: [IconComponent, MessageComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {

}
