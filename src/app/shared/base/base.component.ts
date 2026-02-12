// Abstract base for all components — provides DestroyRef and takeUntilDestroyed helper
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { MonoTypeOperatorFunction } from 'rxjs';

export abstract class BaseComponent {
  protected readonly destroyRef = inject(DestroyRef);

  protected takeUntilDestroyed<T>(): MonoTypeOperatorFunction<T> {
    return takeUntilDestroyed<T>(this.destroyRef);
  }
}
