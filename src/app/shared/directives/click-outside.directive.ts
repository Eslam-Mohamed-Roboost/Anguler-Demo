/**
 * Detects clicks outside the host element.
 *
 * Usage:
 *   <div (appClickOutside)="close()">
 *     Dropdown content...
 *   </div>
 *
 * SSR-safe — no DOM listeners are attached during server-side rendering.
 */
import {
  Directive,
  ElementRef,
  inject,
  OnDestroy,
  output,
  PLATFORM_ID,
  afterNextRender,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutsideDirective implements OnDestroy {
  readonly appClickOutside = output<void>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private listener: ((event: Event) => void) | null = null;

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.listener = (event: Event) => {
          const target = event.target as Node;
          if (target && !this.el.nativeElement.contains(target)) {
            this.appClickOutside.emit();
          }
        };
        document.addEventListener('click', this.listener, true);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.listener) {
      document.removeEventListener('click', this.listener, true);
      this.listener = null;
    }
  }
}
