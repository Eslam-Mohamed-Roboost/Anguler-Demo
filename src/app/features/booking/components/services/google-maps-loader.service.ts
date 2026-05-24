import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../../../environments/environment';

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-js';
const GOOGLE_MAPS_CALLBACK = '__roboostGoogleMapsLoaded';
const GOOGLE_MAPS_TIMEOUT_MS = 15000;

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface LocationSelection extends MapCoordinates {
  address: string;
  name?: string;
  placeId?: string;
}

export interface GoogleLatLng {
  lat(): number;
  lng(): number;
}

export interface GoogleMapMouseEvent {
  latLng: GoogleLatLng | null;
}

export interface GoogleMapsListener {
  remove(): void;
}

export interface GoogleMap {
  setCenter(location: MapCoordinates): void;
  setZoom(zoom: number): void;
  addListener(eventName: 'click', handler: (event: GoogleMapMouseEvent) => void): GoogleMapsListener;
}

export interface GoogleMarker {
  setPosition(location: MapCoordinates): void;
  getPosition(): GoogleLatLng | null;
  addListener(eventName: 'dragend', handler: () => void): GoogleMapsListener;
}

export interface GoogleFormattableText {
  text: string;
}

export interface GooglePlace {
  id?: string;
  displayName?: string | GoogleFormattableText;
  formattedAddress?: string;
  location?: GoogleLatLng | MapCoordinates;
  fetchFields(request: { fields: string[] }): Promise<void>;
}

export interface GooglePlacePrediction {
  placeId: string;
  text: GoogleFormattableText;
  mainText?: GoogleFormattableText;
  secondaryText?: GoogleFormattableText;
  toPlace(): GooglePlace;
}

export interface GoogleAutocompleteSuggestion {
  placePrediction?: GooglePlacePrediction;
}

export interface GoogleAutocompleteSessionToken {
  readonly __brand?: 'GoogleAutocompleteSessionToken';
}

export interface GoogleAutocompleteRequest {
  input: string;
  language?: string;
  origin?: MapCoordinates;
  sessionToken?: GoogleAutocompleteSessionToken;
}

export interface GoogleAutocompleteSuggestionApi {
  fetchAutocompleteSuggestions(
    request: GoogleAutocompleteRequest,
  ): Promise<{ suggestions: GoogleAutocompleteSuggestion[] }>;
}

export interface GooglePlaceSuggestion {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
  prediction: GooglePlacePrediction;
}

export function getGoogleMapsSearchErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (/Places API \(New\).*disabled|Places API \(New\) has not been used/i.test(message)) {
    return 'Google Places API (New) is not enabled for this project.';
  }

  if (/places\.googleapis\.com.*blocked|AutocompletePlaces are blocked/i.test(message)) {
    return 'Google Places API (New) is blocked for this API key or domain.';
  }

  if (/LegacyApiNotActivatedMapError|legacy API/i.test(message)) {
    return 'Google Maps search is using a legacy API. Please enable Places API (New).';
  }

  if (/rejected this API key|RefererNotAllowedMapError|InvalidKeyMapError/i.test(message)) {
    return 'Google Maps rejected this API key or domain.';
  }

  return 'Google Maps search could not be loaded.';
}

export interface GoogleGeocoderResult {
  formatted_address: string;
}

export interface GoogleGeocoder {
  geocode(
    request: { location: MapCoordinates },
    callback: (results: GoogleGeocoderResult[] | null, status: string) => void,
  ): void;
}

export interface GoogleMapsApi {
  importLibrary(libraryName: string): Promise<unknown>;
  Map: new (
    element: HTMLElement,
    options: {
      center: MapCoordinates;
      zoom: number;
      fullscreenControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
    },
  ) => GoogleMap;
  Marker: new (
    options: {
      position: MapCoordinates;
      map: GoogleMap;
      draggable?: boolean;
      title?: string;
    },
  ) => GoogleMarker;
  Geocoder: new () => GoogleGeocoder;
  places: {
    AutocompleteSessionToken: new () => GoogleAutocompleteSessionToken;
    AutocompleteSuggestion: GoogleAutocompleteSuggestionApi;
  };
}

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsApi;
    };
    __roboostGoogleMapsLoaded?: () => void;
    gm_authFailure?: () => void;
  }
}

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private loadPromise: Promise<GoogleMapsApi> | null = null;
  private autocompleteSessionToken: GoogleAutocompleteSessionToken | null = null;

  load(): Promise<GoogleMapsApi> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.reject(new Error('Google Maps can only load in the browser.'));
    }

    const loadedMaps = this.getLoadedMapsApi();
    if (loadedMaps) {
      return Promise.resolve(loadedMaps);
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    if (!environment.googleMapsApiKey) {
      return Promise.reject(new Error('Google Maps API key is missing.'));
    }

    const existingScript = this.document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

    const promise = new Promise<GoogleMapsApi>((resolve, reject) => {
      let settled = false;
      const previousCallback = window.__roboostGoogleMapsLoaded;
      const previousAuthFailure = window.gm_authFailure;
      const timeoutId = window.setTimeout(() => {
        rejectLoad(new Error('Timed out while loading Google Maps.'));
      }, GOOGLE_MAPS_TIMEOUT_MS);

      const cleanup = (): void => {
        window.clearTimeout(timeoutId);

        if (previousCallback) {
          window.__roboostGoogleMapsLoaded = previousCallback;
        } else {
          delete window.__roboostGoogleMapsLoaded;
        }

        if (previousAuthFailure) {
          window.gm_authFailure = previousAuthFailure;
        } else {
          delete window.gm_authFailure;
        }
      };

      const resolveLoad = (): void => {
        if (settled) return;

        void this.ensureGoogleMapsLibraries()
          .then((maps) => {
            if (settled) return;

            settled = true;
            cleanup();
            resolve(maps);
          })
          .catch(() => {
            rejectLoad(new Error('Google Maps script loaded without the required Places API.'));
          });
      };

      const rejectLoad = (error: Error): void => {
        if (settled) return;

        settled = true;
        cleanup();
        reject(error);
      };

      window.__roboostGoogleMapsLoaded = resolveLoad;
      window.gm_authFailure = () => {
        rejectLoad(new Error('Google Maps rejected this API key or referrer.'));
      };

      if (existingScript) {
        if (this.getLoadedMapsApi() || window.google?.maps?.importLibrary) {
          resolveLoad();
          return;
        }

        existingScript.addEventListener('load', resolveLoad, { once: true });
        existingScript.addEventListener('error', () => rejectLoad(new Error('Failed to load Google Maps.')), { once: true });
        return;
      }

      const script = this.document.createElement('script');
      script.id = GOOGLE_MAPS_SCRIPT_ID;
      script.async = true;
      script.defer = true;
      script.src = this.buildScriptUrl();
      script.addEventListener('error', () => rejectLoad(new Error('Failed to load Google Maps.')), { once: true });

      this.document.head.appendChild(script);
    });

    this.loadPromise = promise.catch((error: unknown) => {
      this.loadPromise = null;
      throw error;
    });

    return this.loadPromise;
  }

  private getLoadedMapsApi(): GoogleMapsApi | null {
    const maps = window.google?.maps;
    if (
      !maps?.importLibrary ||
      !maps.Map ||
      !maps.Marker ||
      !maps.Geocoder ||
      !maps.places?.AutocompleteSuggestion ||
      !maps.places.AutocompleteSessionToken
    ) {
      return null;
    }

    return maps;
  }

  private async ensureGoogleMapsLibraries(): Promise<GoogleMapsApi> {
    const maps = window.google?.maps;
    if (!maps?.importLibrary) {
      throw new Error('Google Maps importLibrary is not available.');
    }

    await Promise.all([
      maps.importLibrary('maps'),
      maps.importLibrary('places'),
      maps.importLibrary('geocoding'),
    ]);

    const loadedMaps = this.getLoadedMapsApi();
    if (!loadedMaps) {
      throw new Error('Google Maps libraries are incomplete.');
    }

    return loadedMaps;
  }

  private buildScriptUrl(): string {
    const params = new URLSearchParams({
      key: environment.googleMapsApiKey,
      callback: GOOGLE_MAPS_CALLBACK,
      loading: 'async',
      v: 'weekly',
    });

    return `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
  }

  async fetchPlaceSuggestions(input: string, origin?: MapCoordinates): Promise<GooglePlaceSuggestion[]> {
    const query = input.trim();
    if (query.length < 3) return [];

    const maps = await this.load();
    this.autocompleteSessionToken ??= new maps.places.AutocompleteSessionToken();

    const request: GoogleAutocompleteRequest = {
      input: query,
      sessionToken: this.autocompleteSessionToken,
    };

    if (origin) {
      request.origin = origin;
    }

    const { suggestions } = await maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

    return suggestions
      .map((suggestion) => suggestion.placePrediction)
      .filter((prediction): prediction is GooglePlacePrediction => !!prediction)
      .map((prediction) => ({
        placeId: prediction.placeId,
        text: prediction.text.text,
        mainText: prediction.mainText?.text ?? prediction.text.text,
        secondaryText: prediction.secondaryText?.text ?? '',
        prediction,
      }));
  }

  async resolvePlaceSuggestion(suggestion: GooglePlaceSuggestion): Promise<LocationSelection> {
    const place = suggestion.prediction.toPlace();
    await place.fetchFields({ fields: ['id', 'displayName', 'formattedAddress', 'location'] });
    this.autocompleteSessionToken = null;

    const location = this.getCoordinates(place.location);
    if (!location) {
      throw new Error('Selected place does not include coordinates.');
    }

    return {
      ...location,
      address: place.formattedAddress ?? suggestion.text,
      name: this.getTextValue(place.displayName) ?? suggestion.mainText,
      placeId: place.id ?? suggestion.placeId,
    };
  }

  resetAutocompleteSession(): void {
    this.autocompleteSessionToken = null;
  }

  private getCoordinates(location: GoogleLatLng | MapCoordinates | undefined): MapCoordinates | null {
    if (!location) return null;

    const googleLatLng = location as Partial<GoogleLatLng>;
    if (typeof googleLatLng.lat === 'function' && typeof googleLatLng.lng === 'function') {
      return { lat: googleLatLng.lat(), lng: googleLatLng.lng() };
    }

    const literal = location as Partial<MapCoordinates>;
    if (typeof literal.lat === 'number' && typeof literal.lng === 'number') {
      return { lat: literal.lat, lng: literal.lng };
    }

    return null;
  }

  private getTextValue(value: string | GoogleFormattableText | undefined): string | undefined {
    if (!value) return undefined;
    return typeof value === 'string' ? value : value.text;
  }
}
