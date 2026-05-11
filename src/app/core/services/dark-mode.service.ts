import { Injectable, effect, signal, computed } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private readonly document = inject(DOCUMENT);

  private readonly darkModeSignal = signal<boolean | null>(null);

  readonly isDarkMode = computed(() => {
    const stored = this.darkModeSignal();

    // If explicitly set, use that value
    if (stored !== null) {
      return stored;
    }

    // Otherwise, detect system preference
    return this.getSystemPreference();
  });

  constructor() {
    // Initialize dark mode on service creation
    this.initializeDarkMode();

    // Listen for system theme changes
    this.listenToSystemThemeChanges();

    // Apply dark mode class when preference changes
    effect(() => {
      const isDark = this.isDarkMode();
      this.applyDarkMode(isDark);
    });
  }

  private initializeDarkMode(): void {
    // Try to load from localStorage
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      this.darkModeSignal.set(stored === 'true');
    } else {
      // Default to system preference
      this.darkModeSignal.set(null);
    }
  }

  private getSystemPreference(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private listenToSystemThemeChanges(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Only update if user hasn't explicitly set dark mode preference
      if (this.darkModeSignal() === null) {
        this.applyDarkMode(this.getSystemPreference());
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    }
  }

  private applyDarkMode(isDark: boolean): void {
    const html = this.document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  /**
   * Toggle dark mode on/off
   */
  toggleDarkMode(): void {
    const newValue = !this.isDarkMode();
    this.darkModeSignal.set(newValue);
    localStorage.setItem('darkMode', String(newValue));
  }

  /**
   * Set dark mode explicitly
   */
  setDarkMode(isDark: boolean): void {
    this.darkModeSignal.set(isDark);
    localStorage.setItem('darkMode', String(isDark));
  }

  /**
   * Reset to system preference
   */
  resetToSystemPreference(): void {
    this.darkModeSignal.set(null);
    localStorage.removeItem('darkMode');
  }
}
