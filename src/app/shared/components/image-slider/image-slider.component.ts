/**
 * Image Slider / Carousel — responsive, accessible, with auto-play,
 * keyboard navigation, dot indicators, and smooth animations.
 *
 * Usage:
 *   <app-image-slider
 *     [slides]="slides"
 *     [autoPlay]="true"
 *     [interval]="5000"
 *     [showDots]="true"
 *     [showArrows]="true"
 *     [aspectRatio]="'16/9'"
 *     [transition]="'slide'"
 *   />
 *
 *   // Where slides is:
 *   readonly slides: SlideItem[] = [
 *     { src: 'https://picsum.photos/800/400?random=1', alt: 'Slide 1', caption: 'First slide' },
 *     { src: 'https://picsum.photos/800/400?random=2', alt: 'Slide 2' },
 *   ];
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

export interface SlideItem {
  /** Image source URL */
  src: string;
  /** Accessible alt text */
  alt: string;
  /** Optional caption text */
  caption?: string;
  /** Optional link URL */
  link?: string;
}

@Component({
  selector: 'app-image-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    class: 'block',
    '(keydown.ArrowLeft)': 'prev()',
    '(keydown.ArrowRight)': 'next()',
  },
  templateUrl: './image-slider.component.html',
  styleUrl: './image-slider.component.css',
})
export class ImageSliderComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  /** Array of slide items to display */
  readonly slides = input.required<readonly SlideItem[]>();

  /** Enable auto-play */
  readonly autoPlay = input(false);

  /** Auto-play interval in milliseconds */
  readonly interval = input(5000);

  /** Show dot indicators */
  readonly showDots = input(true);

  /** Show prev/next arrow buttons */
  readonly showArrows = input(true);

  /** CSS aspect-ratio value (e.g. '16/9', '4/3', '21/9') */
  readonly aspectRatio = input('16/9');

  /** Transition effect */
  readonly transition = input<'slide' | 'fade'>('slide');

  /** Visual variant */
  readonly variant = input<'default' | 'rounded' | 'card'>('default');

  /** Show caption overlay */
  readonly showCaptions = input(true);

  /** Emitted when slide changes */
  readonly slideChange = output<number>();

  /** Current active slide index */
  protected readonly currentIndex = signal(0);

  /** Whether the slider is being hovered (pauses auto-play) */
  protected readonly isHovered = signal(false);

  /** Direction of current transition */
  protected readonly direction = signal<'next' | 'prev'>('next');

  /** Whether a transition is currently animating */
  protected readonly isAnimating = signal(false);

  /** Total slide count */
  protected readonly slideCount = computed(() => this.slides().length);

  /** Container classes based on variant */
  protected readonly containerClasses = computed(() => {
    const base = 'image-slider relative overflow-hidden';
    switch (this.variant()) {
      case 'rounded': return `${base} rounded-xl`;
      case 'card': return `${base} rounded-xl shadow-lg dark:shadow-gray-900/50`;
      default: return `${base} rounded-lg`;
    }
  });

  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Auto-play effect
    effect(() => {
      const shouldPlay = this.autoPlay() && this.slideCount() > 1 && !this.isHovered();
      const ms = this.interval();
      this.clearAutoPlay();

      if (shouldPlay && isPlatformBrowser(this.platformId)) {
        this.autoPlayTimer = setInterval(() => this.next(), ms);
      }
    });

    this.destroyRef.onDestroy(() => this.clearAutoPlay());
  }

  /** Go to a specific slide */
  protected goTo(index: number): void {
    if (this.isAnimating() || index === this.currentIndex()) return;

    const count = this.slideCount();
    if (count === 0) return;

    this.direction.set(index > this.currentIndex() ? 'next' : 'prev');
    this.isAnimating.set(true);
    this.currentIndex.set(((index % count) + count) % count);
    this.slideChange.emit(this.currentIndex());

    setTimeout(() => this.isAnimating.set(false), 500);
  }

  /** Go to next slide */
  protected next(): void {
    this.direction.set('next');
    this.goToInternal((this.currentIndex() + 1) % this.slideCount());
  }

  /** Go to previous slide */
  protected prev(): void {
    this.direction.set('prev');
    this.goToInternal(
      (this.currentIndex() - 1 + this.slideCount()) % this.slideCount(),
    );
  }

  protected onMouseEnter(): void {
    this.isHovered.set(true);
  }

  protected onMouseLeave(): void {
    this.isHovered.set(false);
  }

  protected trackByIndex(index: number): number {
    return index;
  }

  private goToInternal(index: number): void {
    if (this.isAnimating() || index === this.currentIndex()) return;
    this.isAnimating.set(true);
    this.currentIndex.set(index);
    this.slideChange.emit(index);
    setTimeout(() => this.isAnimating.set(false), 500);
  }

  private clearAutoPlay(): void {
    if (this.autoPlayTimer !== null) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }
}
