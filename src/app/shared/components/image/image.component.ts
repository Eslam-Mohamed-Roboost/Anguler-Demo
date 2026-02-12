/**
 * Shared reusable image — wraps NgOptimizedImage with error fallback,
 * style variants, and accessibility defaults.
 *
 * NOTE: NgOptimizedImage does NOT work for inline base64 images.
 *
 * Usage (fixed size):
 *   <app-image
 *     src="/assets/hero.jpg"
 *     alt="Hero banner"
 *     [width]="800"
 *     [height]="400"
 *     [priority]="true"
 *   />
 *
 * Usage (fill mode — image fills its positioned parent):
 *   <div class="relative h-48 w-full">
 *     <app-image src="/assets/cover.jpg" alt="Cover" fill />
 *   </div>
 *
 * Usage (avatar):
 *   <app-image
 *     src="/assets/avatar.jpg"
 *     alt="Jane Doe"
 *     variant="avatar"
 *     [width]="48"
 *     [height]="48"
 *   />
 *
 * Usage (rounded):
 *   <app-image
 *     src="/assets/photo.jpg"
 *     alt="Photo"
 *     variant="rounded"
 *     [width]="200"
 *     [height]="200"
 *   />
 *
 * Fallback:
 *   When the image fails to load, a placeholder with an icon is shown.
 *   Provide [fallbackSrc] to show a replacement image instead.
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, IconComponent],
  templateUrl: './image.component.html',
  styleUrl: './image.component.css',
})
export class ImageComponent {
  /** Image source URL — required */
  readonly src = input.required<string>();

  /** Accessible alt text — required for a11y */
  readonly alt = input('');

  /** Intrinsic width in pixels (required when fill is false) */
  readonly width = input<number>(0);

  /** Intrinsic height in pixels (required when fill is false) */
  readonly height = input<number>(0);

  /** Whether to use fill mode (image fills its positioned parent) */
  readonly fill = input(false);

  /** Mark as priority for LCP — disables lazy loading */
  readonly priority = input(false);

  /** Optional placeholder — 'blur' enables automatic blur-up */
  readonly placeholder = input<string | boolean>(false);

  /** Optional fallback image URL shown when src fails to load */
  readonly fallbackSrc = input('');

  /** Visual variant */
  readonly variant = input<'default' | 'rounded' | 'avatar' | 'thumbnail'>('default');

  /** Extra CSS classes to apply to the image element */
  readonly imgClass = input('');

  /** Whether the image has errored */
  protected readonly hasError = signal(false);

  /** Whether the fallback has also errored */
  protected readonly fallbackError = signal(false);

  /** Resolved placeholder value for NgOptimizedImage */
  protected readonly resolvedPlaceholder = computed((): string | boolean => {
    const p = this.placeholder();
    if (p === true || p === 'blur') return true;
    if (typeof p === 'string' && p.length > 0) return p;
    return false;
  });

  /** Computed CSS classes based on variant */
  protected readonly classes = computed(() => {
    const base = 'max-w-full';
    const extra = this.imgClass();

    const variantClass = {
      default: '',
      rounded: 'rounded-lg',
      avatar: 'rounded-full object-cover',
      thumbnail: 'rounded border border-gray-200 dark:border-gray-700',
    }[this.variant()];

    return [base, variantClass, extra].filter(Boolean).join(' ');
  });

  /** Wrapper classes for the fallback placeholder */
  protected readonly fallbackClasses = computed(() => {
    const base = 'flex items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500';

    const variantClass = {
      default: 'rounded',
      rounded: 'rounded-lg',
      avatar: 'rounded-full',
      thumbnail: 'rounded border border-gray-200 dark:border-gray-700',
    }[this.variant()];

    return `${base} ${variantClass}`;
  });

  /** Computed wrapper styles (width/height) for fallback */
  protected readonly fallbackStyle = computed(() => {
    if (this.fill()) return {};
    const w = this.width();
    const h = this.height();
    return {
      width: w ? `${w}px` : 'auto',
      height: h ? `${h}px` : 'auto',
    };
  });

  /** Whether to show fill mode */
  protected readonly isFill = computed(() => this.fill());

  /** Whether to show the fallback placeholder */
  protected readonly showFallback = computed(
    () => this.hasError() && (this.fallbackError() || !this.fallbackSrc()),
  );

  /** Whether to show the fallback image */
  protected readonly showFallbackImage = computed(
    () => this.hasError() && !this.fallbackError() && !!this.fallbackSrc(),
  );

  onError(): void {
    this.hasError.set(true);
  }

  onFallbackError(): void {
    this.fallbackError.set(true);
  }
}
