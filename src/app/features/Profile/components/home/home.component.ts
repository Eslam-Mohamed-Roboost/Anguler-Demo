import { Component } from '@angular/core';
import {ProfileImageComponent} from '../profile-image/profile-image.component';
import {ProfileTabsComponent} from '../profile-tabs/profile-tabs.component';
@Component({
  selector: 'app-home.component',
  imports: [ProfileImageComponent, ProfileTabsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {

}
