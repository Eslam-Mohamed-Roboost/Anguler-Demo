// Global loading indicator — increments/decrements a counter per in-flight request
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { GlobalLoadingStore } from '../stores/loading.store';
import { SKIP_LOADING } from '../tokens/skip-loading.token';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingStore = inject(GlobalLoadingStore);

  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  loadingStore.increment();

  return next(req).pipe(finalize(() => loadingStore.decrement()));
};
