/**
 * Centralized logging service — SSR-safe, configurable log levels.
 *
 * Usage:
 *   private readonly logger = inject(LoggerService);
 *   this.logger.debug('Loaded items', items);
 *   this.logger.info('User logged in');
 *   this.logger.warn('Deprecated API used');
 *   this.logger.error('Failed to fetch', error);
 *
 * Log levels: debug < info < warn < error < off
 * Set the level via `setLevel()`. Default is 'debug' in dev, 'warn' in prod.
 */
import { inject, Injectable, isDevMode, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'off';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  off: 4,
};

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly platformId = inject(PLATFORM_ID);
  private level: LogLevel = isDevMode() ? 'debug' : 'warn';

  /** Set the minimum log level */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string, ...data: unknown[]): void {
    this.log('debug', message, data);
  }

  info(message: string, ...data: unknown[]): void {
    this.log('info', message, data);
  }

  warn(message: string, ...data: unknown[]): void {
    this.log('warn', message, data);
  }

  error(message: string, ...data: unknown[]): void {
    this.log('error', message, data);
  }

  private log(level: LogLevel, message: string, data: unknown[]): void {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this.level]) return;

    const timestamp = isPlatformBrowser(this.platformId)
      ? new Date().toLocaleTimeString()
      : new Date().toISOString();

    const prefix = `[${level.toUpperCase()}] ${timestamp}`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, ...data);
        break;
      case 'info':
        console.info(prefix, message, ...data);
        break;
      case 'warn':
        console.warn(prefix, message, ...data);
        break;
      case 'error':
        console.error(prefix, message, ...data);
        break;
    }
  }
}
