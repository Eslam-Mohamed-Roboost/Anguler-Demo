/**
 * User avatar with image or fallback initials.
 *
 * Usage:
 *   <app-avatar name="John Doe" />
 *   <app-avatar name="Jane" src="/assets/jane.jpg" size="lg" />
 *   <app-avatar name="Admin" [online]="true" />
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css',
})
export class AvatarComponent {
  /** Full name — used for initials fallback and aria-label */
  readonly name = input.required<string>();

  /** Image URL — if provided, the image is shown; on error, falls back to initials */
  readonly src = input('');

  /** Size variant */
  readonly size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

  /** Show an online status indicator dot */
  readonly online = input<boolean | null>(null);

  protected readonly hasError = signal(false);

  /** Whether to show the image or the initials fallback */
  protected readonly showImage = computed(() => !!this.src() && !this.hasError());

  /** Extract up to 2 uppercase initials from the name */
  protected readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  /** Deterministic background colour based on name hash */
  protected readonly bgColor = computed(() => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500',
      'bg-red-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
    ];
    let hash = 0;
    const str = this.name();
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  });

  protected readonly sizeClasses = computed(() => {
    const map = {
      xs: 'size-6 text-[10px]',
      sm: 'size-8 text-xs',
      md: 'size-10 text-sm',
      lg: 'size-12 text-base',
      xl: 'size-16 text-lg',
    };
    return map[this.size()];
  });

  protected readonly imgDimension = computed(() => {
    const map = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };
    return map[this.size()];
  });

  protected readonly dotClasses = computed(() => {
    const sizeMap = {
      xs: 'size-1.5',
      sm: 'size-2',
      md: 'size-2.5',
      lg: 'size-3',
      xl: 'size-3.5',
    };
    const color = this.online() ? 'bg-green-500' : 'bg-gray-400';
    return `absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-800 ${sizeMap[this.size()]} ${color}`;
  });

  protected onImageError(): void {
    this.hasError.set(true);
  }
}
