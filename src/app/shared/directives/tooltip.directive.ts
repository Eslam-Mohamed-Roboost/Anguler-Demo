/**
 * Lightweight tooltip directive — shows a positioned tooltip on hover/focus.
 *
 * Usage:
 *   <button [appTooltip]="'Delete this item'" tooltipPosition="top">Delete</button>
 *   <app-icon name="info" [appTooltip]="'More details'" tooltipPosition="bottom" />
 *
 * Accessible: sets aria-describedby on the host and role="tooltip" on the tip.
 * SSR-safe: no DOM manipulation during server-side rendering.
 */
import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
  },
})
export class TooltipDirective implements OnDestroy {
  readonly appTooltip = input.required<string>();
  readonly tooltipPosition = input<'top' | 'bottom'>('top');

  private tooltipEl: HTMLElement | null = null;
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  show(): void {
    if (!isPlatformBrowser(this.platformId) || !this.appTooltip()) return;
    this.hide();

    const tooltip = document.createElement('div');
    tooltip.textContent = this.appTooltip();
    tooltip.className =
      'fixed z-[9999] rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg pointer-events-none dark:bg-gray-700 whitespace-nowrap transition-opacity duration-150';
    tooltip.style.opacity = '0';
    tooltip.setAttribute('role', 'tooltip');

    const id = `tip-${Math.random().toString(36).slice(2, 8)}`;
    tooltip.id = id;

    document.body.appendChild(tooltip);
    this.tooltipEl = tooltip;
    this.el.nativeElement.setAttribute('aria-describedby', id);

    // Position after the DOM has rendered the tooltip, then fade in
    requestAnimationFrame(() => {
      this.position();
      if (this.tooltipEl) {
        this.tooltipEl.style.opacity = '1';
      }
    });
  }

  hide(): void {
    if (this.tooltipEl) {
      this.el.nativeElement.removeAttribute('aria-describedby');
      this.tooltipEl.remove();
      this.tooltipEl = null;
    }
  }

  ngOnDestroy(): void {
    this.hide();
  }

  private position(): void {
    if (!this.tooltipEl) return;

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tipRect = this.tooltipEl.getBoundingClientRect();
    const pos = this.tooltipPosition();

    let top: number;
    let left = hostRect.left + hostRect.width / 2 - tipRect.width / 2;

    if (pos === 'bottom') {
      top = hostRect.bottom + 6;
    } else {
      top = hostRect.top - tipRect.height - 6;
    }

    // Keep within viewport
    left = Math.max(4, Math.min(left, window.innerWidth - tipRect.width - 4));

    this.tooltipEl.style.top = `${top}px`;
    this.tooltipEl.style.left = `${left}px`;
  }
}
