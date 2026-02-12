/**
 * Formats bytes as a human-readable file size string.
 *
 * Usage:
 *   {{ 1536 | fileSize }}           → "1.5 KB"
 *   {{ 2097152 | fileSize }}        → "2.0 MB"
 *   {{ 5368709120 | fileSize }}     → "5.0 GB"
 *   {{ 0 | fileSize }}              → "0 B"
 */
import { Pipe, PipeTransform } from '@angular/core';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined, decimals = 1): string {
    if (bytes == null || bytes === 0) return '0 B';
    if (bytes < 0) return '—';

    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const unit = UNITS[Math.min(i, UNITS.length - 1)];
    const value = bytes / Math.pow(k, i);

    return `${value.toFixed(decimals)} ${unit}`;
  }
}
