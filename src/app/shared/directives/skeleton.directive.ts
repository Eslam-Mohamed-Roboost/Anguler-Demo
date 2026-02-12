/**
 * Structural skeleton directive — replaces host content with a skeleton placeholder.
 *
 * Usage:
 *   <div *appSkeleton="isLoading()">Real content here</div>
 *
 *   <!-- With custom height/width -->
 *   <p *appSkeleton="isLoading(); height: '1.5rem'; width: '60%'">Text content</p>
 *
 * When loading is true, the host element is hidden and a pulsing skeleton block is shown.
 * When loading is false, the real content is displayed.
 */
import {
  Directive,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
  effect,
  EmbeddedViewRef,
  ElementRef,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appSkeleton]',
})
export class SkeletonDirective {
  /** When true, show skeleton; when false, show real content */
  readonly appSkeleton = input.required<boolean>();
  readonly appSkeletonHeight = input('1rem');
  readonly appSkeletonWidth = input('100%');
  readonly appSkeletonCount = input(1);

  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);

  private embeddedView: EmbeddedViewRef<unknown> | null = null;
  private skeletonEls: HTMLElement[] = [];

  constructor() {
    effect(() => {
      const loading = this.appSkeleton();
      this.clearAll();

      if (loading) {
        this.showSkeleton();
      } else {
        this.showContent();
      }
    });
  }

  private showContent(): void {
    this.embeddedView = this.viewContainer.createEmbeddedView(this.templateRef);
  }

  private showSkeleton(): void {
    const count = this.appSkeletonCount();
    for (let i = 0; i < count; i++) {
      const el = this.renderer.createElement('div') as HTMLElement;
      el.className = 'animate-pulse rounded bg-gray-200 dark:bg-gray-700';
      el.style.width = this.appSkeletonWidth();
      el.style.height = this.appSkeletonHeight();
      if (i > 0) el.style.marginTop = '0.5rem';
      el.setAttribute('aria-hidden', 'true');

      // Insert the skeleton element at the directive's anchor position
      const anchor = this.viewContainer.element.nativeElement as Comment;
      anchor.parentNode?.insertBefore(el, anchor.nextSibling);
      this.skeletonEls.push(el);
    }
  }

  private clearAll(): void {
    this.viewContainer.clear();
    this.embeddedView = null;
    for (const el of this.skeletonEls) {
      el.remove();
    }
    this.skeletonEls = [];
  }
}
