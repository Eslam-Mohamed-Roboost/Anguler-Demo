// Abstract CRUD component — extends list with delete capability
import { signal } from '@angular/core';
import { BaseListComponent } from './base-list.component';

export abstract class BaseCrudComponent<T> extends BaseListComponent<T> {
  protected readonly deleteLoading = signal<string | number | null>(null);

  deleteItem(id: number | string): void {
    this.deleteLoading.set(id);

    this.service
      .delete(id)
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.deleteLoading.set(null);
          this.reload();
        },
        error: () => {
          this.deleteLoading.set(null);
        },
      });
  }
}
