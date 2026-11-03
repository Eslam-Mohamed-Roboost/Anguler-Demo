import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { AppConfigService } from '../../../core/services/app-config.service';
import { ModalComponent } from '../modal/modal.component';
import { IconComponent } from '../icon/icon.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

/**
 * Hotel onboarding on first sign-in: offers to connect a payout account.
 * Shown while GET /users/profile returns `configuration.onboarding: true`;
 * "Connect" or "Later" calls PUT /hotels/onboarding/complete so it won't show again.
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
  private readonly destroyRef = inject(DestroyRef);

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
    if (this.checked || !this.auth.hasRole('hotel') || !profile?.configuration) return;

    this.checked = true;
    this.open.set(profile.configuration.onboarding === true);
  });

  protected connectNow(): void {
    this.finish();
    void this.router.navigate(['/profile'], { queryParams: { tab: 'withdrawal', connect: 1 } });
  }

  protected later(): void {
    this.finish();
  }

  /** Closes the popup and tells the backend onboarding is done (finished or skipped). */
  private finish(): void {
    this.open.set(false);
    if (!this.auth.hasRole('hotel')) return; // `?onboarding=1` preview — nothing to save

    this.intent
      .complete()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (!result.isSuccess) return;
          const profile = this.auth.profile();
          if (profile?.configuration) {
            this.auth.setProfile({ ...profile, configuration: { ...profile.configuration, onboarding: false } });
          }
        },
      });
  }
}
