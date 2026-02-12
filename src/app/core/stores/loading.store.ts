// Global loading state — tracks concurrent in-flight HTTP requests
import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalLoadingStore {
  private readonly _count = signal(0);
  readonly isLoading = computed(() => this._count() > 0);

  increment(): void {
    this._count.update((c) => c + 1);
  }

  decrement(): void {
    this._count.update((c) => Math.max(0, c - 1));
  }
}
