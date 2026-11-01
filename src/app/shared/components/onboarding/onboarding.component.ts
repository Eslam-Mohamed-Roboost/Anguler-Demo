import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { AppConfigService } from '../../../core/services/app-config.service';
import { ModalComponent } from '../modal/modal.component';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

/**
 * Home page onboarding: offers a signed-in hotel to connect a payout account.
 * Shown by default to any signed-in hotel (once per browser session, again after each sign-in);
 * hidden only when GET /users/profile returns `configuration.hasPayoutAccount: true`.
 */
interface ConfettiPiece {
  kind: 'bar' | 'curl';
  left: number;
  top: number;
  rotate: number;
  color: 'orange' | 'green';
}

@Component({
  selector: 'app-onboarding',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, IconComponent, TranslatePipe, NgOptimizedImage],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
})
export class OnboardingComponent {
  private readonly auth = inject(AuthService);
  private readonly intent = inject(OnboardingService);
  private readonly appConfig = inject(AppConfigService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly open = signal(false);
  /** Decorative confetti around the illustration (positions in %, matching the design). */
  protected readonly confetti: readonly ConfettiPiece[] = [
    { kind: 'curl', left: 4, top: 12, rotate: -20, color: 'orange' },
    { kind: 'bar', left: 2, top: 1, rotate: 30, color: 'green' },
    { kind: 'bar', left: 18, top: 16, rotate: -15, color: 'green' },
    { kind: 'bar', left: 22, top: 6, rotate: 20, color: 'orange' },
    { kind: 'curl', left: 13, top: 2, rotate: 15, color: 'orange' },
    { kind: 'bar', left: 32, top: 1, rotate: -25, color: 'green' },
    { kind: 'curl', left: 44, top: 0, rotate: 0, color: 'orange' },
    { kind: 'bar', left: 52, top: 2, rotate: 10, color: 'orange' },
    { kind: 'bar', left: 64, top: 3, rotate: -10, color: 'orange' },
    { kind: 'curl', left: 66, top: 12, rotate: 25, color: 'orange' },
    { kind: 'bar', left: 74, top: 2, rotate: 35, color: 'green' },
    { kind: 'bar', left: 84, top: 10, rotate: -20, color: 'orange' },
    { kind: 'curl', left: 92, top: 4, rotate: -30, color: 'orange' },
    { kind: 'bar', left: 94, top: 16, rotate: 25, color: 'green' },
    { kind: 'bar', left: 74, top: 22, rotate: -40, color: 'green' },
  ];
  protected readonly commissionPercentage = computed(() => this.appConfig.commissionPercentage());
  private checked = false;

  private readonly checkAfterLogin = effect(() => {
    // `?onboarding=1` previews the popup for any user (design / QA).
    if (!this.checked && this.route.snapshot.queryParamMap.get('onboarding') === '1') {
      this.checked = true;
      this.open.set(true);
      return;
    }

    const profile = this.auth.profile();
    if (!this.auth.isAuthenticated()) {
      // Signed out — allow the prompt again on the next sign-in without a page reload.
      this.checked = false;
      this.open.set(false);
      return;
    }
    if (this.checked || !this.auth.hasRole('hotel') || !profile) return;
    if (this.intent.isDismissed()) return;

    this.checked = true;
    // Shown by default; hidden only when the profile says a payout account is already connected.
    this.open.set(profile.configuration?.hasPayoutAccount !== true);
  });

  protected connectNow(): void {
    this.intent.dismiss();
    this.open.set(false);
    void this.router.navigate(['/profile'], { queryParams: { tab: 'withdrawal', connect: 1 } });
  }

  protected later(): void {
    this.intent.dismiss();
    this.open.set(false);
  }
}
