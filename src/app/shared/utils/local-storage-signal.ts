/**
 * LocalStorageSignal — a writable signal that auto-persists to localStorage.
 *
 * SSR-safe: falls back to a regular in-memory signal on the server.
 *
 * Usage:
 *   // In a service or component
 *   readonly language = localStorageSignal<string>('app-lang', 'en');
 *
 *   // Read
 *   console.log(this.language());  // 'en' (or whatever was stored)
 *
 *   // Write — automatically persists
 *   this.language.set('ar');
 *   this.language.update(v => v === 'en' ? 'ar' : 'en');
 */
import { signal, type WritableSignal } from '@angular/core';

export function localStorageSignal<T>(
  key: string,
  defaultValue: T,
): WritableSignal<T> {
  // Read initial value from localStorage (browser only)
  let initial = defaultValue;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        initial = JSON.parse(stored) as T;
      }
    } catch {
      // Invalid JSON — use default
    }
  }

  const sig = signal<T>(initial);

  // Wrap set/update to persist
  const originalSet = sig.set.bind(sig);
  const originalUpdate = sig.update.bind(sig);

  sig.set = (value: T) => {
    originalSet(value);
    persist(key, value);
  };

  sig.update = (fn: (value: T) => T) => {
    originalUpdate(fn);
    persist(key, sig());
  };

  return sig;
}

function persist<T>(key: string, value: T): void {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or blocked — silently ignore
    }
  }
}
