import { Component } from '@angular/core';
import { DetailsComponent } from "../details/details.component";
import { ChatComponent } from "../chat/chat.component";

@Component({
  selector: 'app-trip-details.component',
  imports: [DetailsComponent, ChatComponent],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.css',
})
export class TripDetailsComponent {

}
