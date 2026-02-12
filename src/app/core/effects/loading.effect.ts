// Debounced spinner visibility — avoids flicker on fast requests
import { Injectable, effect, inject, signal } from '@angular/core';
import { GlobalLoadingStore } from '../stores/loading.store';

const DEBOUNCE_MS = 300;

@Injectable({ providedIn: 'root' })
export class LoadingEffect {
  private readonly loadingStore = inject(GlobalLoadingStore);

  readonly showSpinner = signal(false);

  private readonly _ = effect((onCleanup) => {
    const isLoading = this.loadingStore.isLoading();

    if (isLoading) {
      const timeout = setTimeout(() => {
        this.showSpinner.set(true);
      }, DEBOUNCE_MS);

      onCleanup(() => clearTimeout(timeout));
    } else {
      this.showSpinner.set(false);
    }
  });
}
