/**
 * Weather service — fetches current weather data using the official openmeteo package (free, no key).
 *
 * Usage:
 *   const weather = inject(WeatherService);
 *   weather.getWeather(40.7128, -74.006).subscribe(data => ...);
 */
import { Injectable } from '@angular/core';
import { Observable, from, catchError, of } from 'rxjs';
import { fetchWeatherApi } from 'openmeteo';

export interface WeatherData {
  /** City/location name */
  city: string;
  /** Country code (e.g. 'US') */
  country: string;
  /** Weather condition (e.g. 'Partly Cloudy', 'Clear', 'Rain') */
  condition: string;
  /** Weather description */
  description: string;
  /** Icon code for WMO weather */
  iconCode: string;
  /** Icon URL (emoji) */
  iconUrl: string;
  /** Temperature in Celsius */
  tempC: number;
  /** Temperature in Fahrenheit */
  tempF: number;
  /** Humidity percentage */
  humidity: number;
  /** Wind speed in km/h */
  windSpeed: number;
  /** Day of the week */
  dayOfWeek: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** WMO weather code → condition label + emoji icon */
function wmoToCondition(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear Sky', icon: '☀️' };
  if (code <= 3) return { condition: 'Partly Cloudy', icon: '⛅' };
  if (code <= 49) return { condition: 'Foggy', icon: '🌫️' };
  if (code <= 59) return { condition: 'Drizzle', icon: '🌦️' };
  if (code <= 69) return { condition: 'Rainy', icon: '🌧️' };
  if (code <= 79) return { condition: 'Snowy', icon: '🌨️' };
  if (code <= 84) return { condition: 'Showers', icon: '🌧️' };
  if (code <= 94) return { condition: 'Snowy', icon: '❄️' };
  return { condition: 'Thunderstorm', icon: '⛈️' };
}

/** Reverse geocode using free Nominatim API */
async function reverseGeocode(lat: number, lng: number): Promise<{ city: string; country: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
    );
    const data = await res.json();
    const addr = data?.address;
    const city = addr?.city ?? addr?.town ?? addr?.village ?? addr?.state ?? 'Unknown';
    const country = (addr?.country_code ?? '').toUpperCase();
    return { city, country };
  } catch {
    return { city: 'Unknown', country: '' };
  }
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  /**
   * Fetch current weather for the given coordinates.
   * Uses official openmeteo package + Nominatim for city name — no API key required.
   */
  getWeather(lat: number, lng: number): Observable<WeatherData | null> {
    return from(this.fetchWeather(lat, lng)).pipe(
      catchError(() => of(null)),
    );
  }

  private async fetchWeather(lat: number, lng: number): Promise<WeatherData> {
    const [responses, geo] = await Promise.all([
      fetchWeatherApi('https://api.open-meteo.com/v1/forecast', {
        latitude: lat,
        longitude: lng,
        current: ['temperature_2m', 'relative_humidity_2m', 'weather_code', 'wind_speed_10m'],
      }),
      reverseGeocode(lat, lng),
    ]);

    const response = responses[0];
    const current = response.current()!;

    const tempC = Math.round(current.variables(0)!.value()); // temperature_2m
    const humidity = Math.round(current.variables(1)!.value()); // relative_humidity_2m
    const weatherCode = current.variables(2)!.value(); // weather_code
    const windSpeed = Math.round(current.variables(3)!.value()); // wind_speed_10m

    const { condition, icon } = wmoToCondition(weatherCode);

    return {
      city: geo.city,
      country: geo.country,
      condition,
      description: condition.toLowerCase(),
      iconCode: String(weatherCode),
      iconUrl: icon,
      tempC,
      tempF: Math.round(tempC * 9 / 5 + 32),
      humidity,
      windSpeed,
      dayOfWeek: DAYS[new Date().getDay()],
    };
  }
}
