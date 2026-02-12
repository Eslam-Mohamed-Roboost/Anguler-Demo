/**
 * Truncates a string to a maximum length, appending a suffix.
 *
 * Usage:
 *   {{ longText | truncate }}             → 50 chars + '...'
 *   {{ longText | truncate:100 }}         → 100 chars + '...'
 *   {{ longText | truncate:80:'—' }}      → 80 chars + '—'
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit = 50, suffix = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    return value.substring(0, limit).trimEnd() + suffix;
  }
}
