// Root component — mounts global Toast, Spinner, and ConfirmDialog once
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingEffect } from './core/effects/loading.effect';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ToastComponent, SpinnerComponent, ConfirmDialogComponent],
  template: `
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      i18n="@@app.skipNav"
    >
      Skip to main content
    </a>
    <router-outlet />
    <app-toast />
    <app-spinner />
    <app-confirm-dialog />
  `,
})
export class App {
  // Injected to ensure effects/services are instantiated at app startup
  private readonly loadingEffect = inject(LoadingEffect);
  private readonly themeService = inject(ThemeService);
}
