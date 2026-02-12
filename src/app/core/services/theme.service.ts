// Theme service — manages light/dark/system theme with localStorage persistence (SSR-safe)
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _theme = signal<Theme>('system');
  readonly theme = this._theme.asReadonly();

  private readonly prefersDark = signal(false);

  readonly isDark = computed(() => {
    const theme = this._theme();
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return this.prefersDark();
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Read saved preference
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        this._theme.set(saved);
      }

      // Detect system preference
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      this.prefersDark.set(mq.matches);
      mq.addEventListener('change', (e) => this.prefersDark.set(e.matches));
    }

    // Apply dark class to <html> reactively
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        document.documentElement.classList.toggle('dark', this.isDark());
      }
    });
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
    }
  }

  toggleTheme(): void {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }
}
