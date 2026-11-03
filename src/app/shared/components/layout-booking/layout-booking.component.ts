import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { OnboardingComponent } from '../onboarding/onboarding.component';

@Component({
  selector: 'app-layout-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LayoutComponent, RouterOutlet, OnboardingComponent],
  template: `
    <app-layout navbarStyle="booking">
      <router-outlet />
    </app-layout>
    <!-- Hotel onboarding (first sign-in) — shows on every page in this layout -->
    <app-onboarding />
  `,
})
export class LayoutBookingComponent {}
