// Product stats — demonstrates @defer lazy loading, computed signals, and input()
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './product-stats.component.html',
  styleUrl: './product-stats.component.css',
})
export class ProductStatsComponent {
  /** Products list passed from parent via input signal */
  readonly products = input.required<Product[]>();

  /** Computed derived state — recalculates reactively when products change */
  protected readonly totalProducts = computed(() => this.products().length);

  protected readonly averagePrice = computed(() => {
    const items = this.products();
    if (items.length === 0) return 0;
    return items.reduce((sum, p) => sum + p.price, 0) / items.length;
  });

  protected readonly totalInventoryValue = computed(() =>
    this.products().reduce((sum, p) => sum + p.price * p.quantity, 0),
  );

  protected readonly activeCount = computed(
    () => this.products().filter((p) => p.isActive).length,
  );
}
