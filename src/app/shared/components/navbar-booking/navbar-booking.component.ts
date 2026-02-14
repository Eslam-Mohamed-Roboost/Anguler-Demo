import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-navbar-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './navbar-booking.component.html',
  host: { class: 'relative z-20 block' },
})
export class NavbarBookingComponent {
  private readonly doc = inject(DOCUMENT);

  /** Logo image source */
  readonly logoSrc = input('assets/booking/logo-lines.png');

  /** Logo alt text */
  readonly logoAlt = input('Lines');

  /** Sign in button text */
  readonly signInText = input('Sign In');

  /** Join us button text */
  readonly joinUsText = input('Join Us Now');

  /** Whether to show the join us button with lightning icon */
  readonly showJoinUsIcon = input(true);

  /** Current language */
  readonly lang = signal<'en' | 'ar'>('en');

  /** Emitted when language changes */
  readonly langChange = output<'en' | 'ar'>();

  /** Emitted when Sign In is clicked */
  readonly signInClick = output<void>();

  /** Emitted when Join Us is clicked */
  readonly joinUsClick = output<void>();

  /** Derived: flag image */
  protected readonly flagSrc = computed(() =>
    this.lang() === 'en' ? 'assets/booking/flag-en.png' : 'assets/booking/flag-ar.svg',
  );

  /** Derived: language display name */
  protected readonly langLabel = computed(() =>
    this.lang() === 'en' ? 'English' : 'العربية',
  );

  toggleLang(): void {
    const next = this.lang() === 'en' ? 'ar' : 'en';
    this.lang.set(next);
    const html = this.doc.documentElement;
    html.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', next);
    this.langChange.emit(next);
  }
}
