/**
 * Extracts initials from a full name.
 *
 * Usage:
 *   {{ 'Alice Johnson' | initials }}        → 'AJ'
 *   {{ 'Alice' | initials }}                → 'A'
 *   {{ 'alice bob charlie' | initials }}    → 'AC' (first + last)
 *   {{ 'alice bob charlie' | initials:3 }}  → 'ABC' (up to 3)
 *   {{ '' | initials }}                     → ''
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initials' })
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined, maxChars = 2): string {
    if (!value?.trim()) return '';

    const parts = value.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0][0].toUpperCase();

    if (maxChars >= parts.length) {
      return parts
        .slice(0, maxChars)
        .map((p) => p[0].toUpperCase())
        .join('');
    }

    // Default: first + last
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
