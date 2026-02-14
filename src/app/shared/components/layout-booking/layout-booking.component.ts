import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-layout-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutComponent, RouterOutlet],
  template: `
    <app-layout navbarStyle="booking">
      <router-outlet />
    </app-layout>
  `,
})
export class LayoutBookingComponent {}
