// Abstract list component — uses rxResource for data fetching with built-in loading/error signals
import { computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import type { BaseCrudService } from '../../core/services/base-crud.service';
import { BaseComponent } from './base.component';
import { ResultHandlerService } from '../../core/services/result-handler.service';

export abstract class BaseListComponent<T> extends BaseComponent {
  protected abstract readonly service: BaseCrudService<T>;
  private readonly resultHandler = inject(ResultHandlerService);

  protected readonly listResource = rxResource<T[], unknown>({
    stream: () => this.resultHandler.mapArrayForRxResource(this.service.getAll()),
  });

  protected readonly items = computed<T[]>(() => this.listResource.value() ?? []);
  protected readonly isLoading = computed(() => this.listResource.isLoading());
  protected readonly hasError = computed(() => this.listResource.error() != null);

  reload(): void {
    this.listResource.reload();
  }
}
