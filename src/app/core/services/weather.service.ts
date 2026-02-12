/**
 * Weather service — fetches current weather data from OpenWeatherMap API.
 *
 * Usage:
 *   const weather = inject(WeatherService);
 *   weather.getWeather(40.7128, -74.006).subscribe(data => ...);
 */
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { SKIP_LOADING } from '../tokens/skip-loading.token';
import { environment } from '../../../environments/environment';

export interface WeatherData {
  /** City/location name */
  city: string;
  /** Country code (e.g. 'US') */
  country: string;
  /** Weather condition (e.g. 'Partly Cloudy', 'Clear', 'Rain') */
  condition: string;
  /** Weather description (e.g. 'scattered clouds') */
  description: string;
  /** OpenWeatherMap icon code (e.g. '02d') */
  iconCode: string;
  /** Icon URL from OpenWeatherMap */
  iconUrl: string;
  /** Temperature in Celsius */
  tempC: number;
  /** Temperature in Fahrenheit */
  tempF: number;
  /** Humidity percentage */
  humidity: number;
  /** Wind speed in m/s */
  windSpeed: number;
  /** Day of the week */
  dayOfWeek: string;
}

/** Raw response shape from OpenWeatherMap /weather endpoint */
interface OwmResponse {
  name: string;
  sys: { country: string };
  weather: { main: string; description: string; icon: string }[];
  main: { temp: number; humidity: number };
  wind: { speed: number };
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Map OWM condition codes to readable names */
function mapCondition(main: string): string {
  const condMap: Record<string, string> = {
    Clear: 'Clear Sky',
    Clouds: 'Partly Cloudy',
    Rain: 'Rainy',
    Drizzle: 'Drizzle',
    Thunderstorm: 'Thunderstorm',
    Snow: 'Snowy',
    Mist: 'Misty',
    Fog: 'Foggy',
    Haze: 'Hazy',
    Dust: 'Dusty',
    Smoke: 'Smoky',
    Tornado: 'Tornado',
  };
  return condMap[main] ?? main;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  /**
   * Fetch current weather for the given coordinates.
   * Uses SKIP_LOADING to avoid triggering the global spinner.
   */
  getWeather(lat: number, lng: number): Observable<WeatherData | null> {
    const apiKey = environment.weatherApiKey;
    if (!apiKey) {
      return of(null);
    }

    const url = `${this.baseUrl}?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

    return this.http
      .get<OwmResponse>(url, {
        context: new HttpContext().set(SKIP_LOADING, true),
      })
      .pipe(
        map((res) => {
          const w = res.weather[0];
          const tempC = Math.round(res.main.temp);
          return {
            city: res.name,
            country: res.sys.country,
            condition: mapCondition(w.main),
            description: w.description,
            iconCode: w.icon,
            iconUrl: `https://openweathermap.org/img/wn/${w.icon}@2x.png`,
            tempC,
            tempF: Math.round(tempC * 9 / 5 + 32),
            humidity: res.main.humidity,
            windSpeed: res.wind.speed,
            dayOfWeek: DAYS[new Date().getDay()],
          } satisfies WeatherData;
        }),
        catchError(() => of(null)),
      );
  }
}
