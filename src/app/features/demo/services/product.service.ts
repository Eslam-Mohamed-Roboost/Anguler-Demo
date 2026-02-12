// Product service — demonstrates SKIP_LOADING for silent background requests
import { Injectable } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../../core/services/base-crud.service';
import { SKIP_LOADING } from '../../../core/tokens/skip-loading.token';
import type { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService extends BaseCrudService<Product> {
  readonly endpoint = '/products';

  /**
   * Demonstrates SKIP_LOADING — fetches categories without triggering
   * the global spinner. Useful for background/silent requests.
   */
  getCategories(): Observable<string[]> {
    const context = new HttpContext().set(SKIP_LOADING, true);
    return this.api.get<string[]>('/categories', undefined, context);
  }
}
