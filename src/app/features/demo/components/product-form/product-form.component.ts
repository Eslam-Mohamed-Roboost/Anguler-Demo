/**
 * Product form — comprehensive demo of every Signal Forms feature:
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ Feature                │ Field(s)       │ Validator / Logic         │
 * ├────────────────────────┼────────────────┼───────────────────────────┤
 * │ required()             │ name, email,   │ Field cannot be empty     │
 * │                        │ sku, category  │                           │
 * │ email()                │ contactEmail   │ Email format validation   │
 * │ minLength() / maxLen() │ name, desc     │ Character count bounds    │
 * │ min() / max()          │ price, qty,    │ Numeric range bounds      │
 * │                        │ discount       │                           │
 * │ pattern()              │ sku            │ Regex: AAA-12345          │
 * │ validate()             │ discount       │ Cross-field: ≤ price      │
 * │ readonly()             │ id             │ Server-generated, no edit │
 * │ disabled()             │ discount       │ Conditional + reason msg  │
 * │ hidden()               │ promoCode      │ Visible only when active  │
 * │ debounce()             │ description    │ 500ms model sync delay    │
 * │ rxResource             │ editResource   │ Load existing product     │
 * │ SKIP_LOADING           │ (service)      │ Silent category fetch     │
 * └─────────────────────────────────────────────────────────────────────┘
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  required,
  email,
  min,
  max,
  minLength,
  maxLength,
  pattern,
  validate,
  disabled,
  hidden,
  debounce,
} from '@angular/forms/signals';
import type { SchemaPathTree } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { BaseFormComponent } from '../../../../shared/base/base-form.component';
import { SkeletonFormComponent } from '../../../../shared/components/skeleton/skeleton-form.component';
import { BtnComponent } from '../../../../shared/components/btn/btn.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { CheckboxComponent } from '../../../../shared/components/checkbox/checkbox.component';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { ProductService } from '../../services/product.service';
import { PRODUCT_CATEGORIES } from '../../models/product.model';
import type { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SkeletonFormComponent,
    BtnComponent,
    IconComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent extends BaseFormComponent<Product> {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationStore);

  /** Route param bound via withComponentInputBinding() */
  readonly id = input<string>();
  readonly isEditMode = computed(() => !!this.id());

  /** Categories list (imported constant — could also be fetched with SKIP_LOADING) */
  protected readonly categories = PRODUCT_CATEGORIES;

  /** rxResource — loads existing product for edit mode */
  protected readonly editResource = rxResource<Product, string | undefined>({
    params: () => this.id(),
    stream: ({ params: id }) => this.productService.getById(id!),
  });

  /** Effect — patches form when edit data arrives */
  private readonly patchOnLoad = effect(() => {
    const product = this.editResource.value();
    if (product) {
      this.patchForm(product);
    }
  });

  initialValue(): Product {
    return {
      id: 0,
      name: '',
      description: '',
      sku: '',
      price: 0,
      quantity: 0,
      contactEmail: '',
      isActive: false,
      discount: 0,
      promoCode: '',
      category: '',
    };
  }

  buildSchema(s: SchemaPathTree<Product>): void {
    // ── required ──────────────────────────────────────────────
    required(s.name, {
      message: $localize`:@@demo.v.nameReq:Name is required`,
    });
    required(s.contactEmail, {
      message: $localize`:@@demo.v.emailReq:Contact email is required`,
    });
    required(s.sku, {
      message: $localize`:@@demo.v.skuReq:SKU is required`,
    });
    required(s.category, {
      message: $localize`:@@demo.v.catReq:Category is required`,
    });

    // ── email ─────────────────────────────────────────────────
    email(s.contactEmail, {
      message: $localize`:@@demo.v.emailFmt:Enter a valid email address`,
    });

    // ── minLength / maxLength ─────────────────────────────────
    minLength(s.name, 3, {
      message: $localize`:@@demo.v.nameMinLen:Name must be at least 3 characters`,
    });
    maxLength(s.name, 100, {
      message: $localize`:@@demo.v.nameMaxLen:Name must be at most 100 characters`,
    });
    minLength(s.description, 10, {
      message: $localize`:@@demo.v.descMinLen:Description must be at least 10 characters`,
    });
    maxLength(s.description, 500, {
      message: $localize`:@@demo.v.descMaxLen:Description must be at most 500 characters`,
    });

    // ── min / max ─────────────────────────────────────────────
    min(s.price, 0.01, {
      message: $localize`:@@demo.v.priceMin:Price must be at least $0.01`,
    });
    max(s.price, 99999, {
      message: $localize`:@@demo.v.priceMax:Price must be at most $99,999`,
    });
    min(s.quantity, 0, {
      message: $localize`:@@demo.v.qtyMin:Quantity cannot be negative`,
    });
    max(s.quantity, 10000, {
      message: $localize`:@@demo.v.qtyMax:Quantity must be at most 10,000`,
    });
    min(s.discount, 0, {
      message: $localize`:@@demo.v.discMin:Discount cannot be negative`,
    });

    // ── pattern ── SKU format: AAA-12345 ──────────────────────
    pattern(s.sku, /^[A-Z]{3}-\d{5}$/, {
      message: $localize`:@@demo.v.skuFmt:SKU must follow format AAA-12345 (e.g. ELC-00123)`,
    });

    // ── validate ── cross-field: discount must not exceed price
    validate(s.discount, ({ value, valueOf }) => {
      const discountVal = value();
      const priceVal = valueOf(s.price);
      if (discountVal > priceVal) {
        return {
          kind: 'discountExceedsPrice',
          message: $localize`:@@demo.v.discPrice:Discount cannot exceed the product price`,
        };
      }
      return null;
    });

    // ── disabled ── discount disabled when price < 50 (with reason)
    disabled(s.discount, ({ valueOf }) =>
      valueOf(s.price) < 50
        ? $localize`:@@demo.v.discDisabled:Set price to $50 or more to enable discount`
        : false,
    );

    // ── hidden ── promoCode shown only when product is active
    hidden(s.promoCode, ({ valueOf }) => !valueOf(s.isActive));

    // ── debounce ── description model sync delayed by 500ms
    debounce(s.description, 500);
  }

  async onSubmit(value: Product): Promise<void> {
    if (this.isEditMode()) {
      await firstValueFrom(this.productService.update(value.id, value));
      this.notifications.showSuccess(
        $localize`:@@demo.form.updateSuccess:Product updated successfully`,
      );
    } else {
      await firstValueFrom(this.productService.create(value));
      this.notifications.showSuccess(
        $localize`:@@demo.form.createSuccess:Product created successfully`,
      );
    }
    this.router.navigate(['/demo']);
  }

  cancel(): void {
    this.router.navigate(['/demo']);
  }
}
