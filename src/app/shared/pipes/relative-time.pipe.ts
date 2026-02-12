/**
 * Formats a Date or ISO string as a human-readable relative time.
 *
 * Usage:
 *   {{ createdAt | relativeTime }}       → "2 hours ago"
 *   {{ updatedAt | relativeTime }}       → "yesterday"
 *   {{ futureDate | relativeTime }}      → "in 3 days"
 *
 * Updates are NOT automatic — use with signals or async pipe for live updates.
 */
import { Pipe, PipeTransform } from '@angular/core';

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const WEEK = 604800;
const MONTH = 2592000;
const YEAR = 31536000;

@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';

    const now = Date.now();
    const diffSec = Math.round((now - date.getTime()) / 1000);
    const absDiff = Math.abs(diffSec);
    const isFuture = diffSec < 0;

    const label = this.getLabel(absDiff);
    if (label === 'just now') return label;

    return isFuture ? `in ${label}` : `${label} ago`;
  }

  private getLabel(seconds: number): string {
    if (seconds < MINUTE) return 'just now';
    if (seconds < HOUR) {
      const m = Math.floor(seconds / MINUTE);
      return m === 1 ? '1 minute' : `${m} minutes`;
    }
    if (seconds < DAY) {
      const h = Math.floor(seconds / HOUR);
      return h === 1 ? '1 hour' : `${h} hours`;
    }
    if (seconds < WEEK) {
      const d = Math.floor(seconds / DAY);
      return d === 1 ? 'yesterday' : `${d} days`;
    }
    if (seconds < MONTH) {
      const w = Math.floor(seconds / WEEK);
      return w === 1 ? '1 week' : `${w} weeks`;
    }
    if (seconds < YEAR) {
      const m = Math.floor(seconds / MONTH);
      return m === 1 ? '1 month' : `${m} months`;
    }
    const y = Math.floor(seconds / YEAR);
    return y === 1 ? '1 year' : `${y} years`;
  }
}
