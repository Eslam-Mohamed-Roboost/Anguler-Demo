/**
 * Weather widget overlay — glassmorphism card showing live weather data.
 *
 * Usage:
 *   <app-weather-widget [lat]="40.7128" [lng]="-74.006" />
 *
 * Designed to be positioned absolutely over a map component.
 * Fetches weather data from OpenWeatherMap via WeatherService.
 */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { WeatherService } from '../../../features/booking/components/services/weather.service';
import type { WeatherData } from '../../../features/booking/components/services/weather.service';

@Component({
  selector: 'app-weather-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './weather-widget.component.html',
  styleUrl: './weather-widget.component.css',
})
export class WeatherWidgetComponent {
  private readonly weatherService = inject(WeatherService);
  private readonly destroyRef = inject(DestroyRef);
  private currentSub: Subscription | null = null;

  /** Latitude for weather lookup */
  readonly lat = input(40.7128);

  /** Longitude for weather lookup */
  readonly lng = input(-74.006);

  /** Weather data state */
  protected readonly weather = signal<WeatherData | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  constructor() {
    effect(() => {
      const lat = this.lat();
      const lng = this.lng();
      this.loading.set(true);
      this.error.set(false);

      // Cancel any previous in-flight request
      this.currentSub?.unsubscribe();

      this.currentSub = this.weatherService
        .getWeather(lat, lng)
        .subscribe({
          next: (data) => {
            this.weather.set(data);
            this.loading.set(false);
          },
          error: () => {
            this.error.set(true);
            this.loading.set(false);
          },
        });
    });

    this.destroyRef.onDestroy(() => this.currentSub?.unsubscribe());
  }
}
