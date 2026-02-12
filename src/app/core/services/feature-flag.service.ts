/**
 * Simple feature flag service — toggle features on/off via code or localStorage.
 *
 * Flags are reactive signals, so components re-render automatically when flags change.
 * Flags persist to localStorage so they survive page reloads (great for dev/testing).
 *
 * Usage:
 *   // In a service or component
 *   private readonly flags = inject(FeatureFlagService);
 *
 *   // Check
 *   if (this.flags.isEnabled('new-dashboard')()) { ... }
 *
 *   // In a template
 *   @if (flags.isEnabled('new-dashboard')()) {
 *     <app-new-dashboard />
 *   }
 *
 *   // Toggle at runtime (e.g. from admin panel or dev tools)
 *   this.flags.enable('new-dashboard');
 *   this.flags.disable('new-dashboard');
 *   this.flags.toggle('new-dashboard');
 *
 *   // Register defaults at app startup
 *   this.flags.registerDefaults({
 *     'new-dashboard': false,
 *     'dark-mode-v2': true,
 *     'experimental-search': false,
 *   });
 */
import { Injectable, signal, computed, type Signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'feature-flags';

  /** Internal map of flag name → writable signal */
  private readonly flags = new Map<string, ReturnType<typeof signal<boolean>>>();

  /** Cached computed signals to avoid creating new ones on every call */
  private readonly computedCache = new Map<string, Signal<boolean>>();

  /** All registered flag names as a signal (for UI listing) */
  private readonly _flagNames = signal<string[]>([]);
  readonly flagNames = this._flagNames.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Register default flag values. Does NOT overwrite existing values
   * (localStorage or previously registered flags take precedence).
   */
  registerDefaults(defaults: Record<string, boolean>): void {
    for (const [name, defaultValue] of Object.entries(defaults)) {
      if (!this.flags.has(name)) {
        this.flags.set(name, signal(defaultValue));
        this.syncFlagNames();
      }
    }
    // Load storage overrides on top
    this.loadFromStorage();
  }

  /** Returns a reactive Signal<boolean> for the given flag (cached per name) */
  isEnabled(name: string): Signal<boolean> {
    let cached = this.computedCache.get(name);
    if (!cached) {
      cached = computed(() => {
        const flag = this.flags.get(name);
        return flag ? flag() : false;
      });
      this.computedCache.set(name, cached);
    }
    return cached;
  }

  /** Enable a flag */
  enable(name: string): void {
    this.setFlag(name, true);
  }

  /** Disable a flag */
  disable(name: string): void {
    this.setFlag(name, false);
  }

  /** Toggle a flag */
  toggle(name: string): void {
    const current = this.flags.get(name);
    this.setFlag(name, current ? !current() : true);
  }

  /** Set a flag to a specific value */
  setFlag(name: string, value: boolean): void {
    const existing = this.flags.get(name);
    if (existing) {
      existing.set(value);
    } else {
      this.flags.set(name, signal(value));
      this.syncFlagNames();
    }
    this.saveToStorage();
  }

  /** Get all flags as a plain object (for debugging / admin panels) */
  getAllFlags(): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    for (const [name, sig] of this.flags) {
      result[name] = sig();
    }
    return result;
  }

  /** Reset all flags to their defaults (clears localStorage) */
  resetAll(): void {
    this.flags.clear();
    this.computedCache.clear();
    this._flagNames.set([]);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /* ── Private helpers ────────────────────────────────────── */

  private syncFlagNames(): void {
    this._flagNames.set([...this.flags.keys()].sort());
  }

  private loadFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as Record<string, boolean>;
      for (const [name, value] of Object.entries(stored)) {
        const existing = this.flags.get(name);
        if (existing) {
          existing.set(value);
        } else {
          this.flags.set(name, signal(value));
        }
      }
      this.syncFlagNames();
    } catch {
      // Corrupted JSON — ignore
    }
  }

  private saveToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.getAllFlags()));
    } catch {
      // Storage full or blocked
    }
  }
}
