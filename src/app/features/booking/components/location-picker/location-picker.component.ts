import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import {
  getGoogleMapsSearchErrorMessage,
  GoogleGeocoder,
  GoogleMap,
  GoogleMapsLoaderService,
  GoogleMapsListener,
  GoogleMarker,
  GooglePlaceSuggestion,
  LocationSelection,
  MapCoordinates,
} from '../services/google-maps-loader.service';

const DEFAULT_LOCATION: LocationSelection = {
  lat: 30.0444,
  lng: 31.2357,
  address: 'Cairo, Egypt',
  name: 'Cairo',
};

@Component({
  selector: 'app-location-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe],
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.css',
})
export class LocationPickerComponent {
  readonly initialLocation = input<LocationSelection | null>(null);
  readonly confirmLabel = input('Use this location');
  readonly showSummary = input(true);
  readonly showActions = input(true);
  readonly mapHeight = input('min(52vh, 420px)');
  readonly locationChange = output<LocationSelection>();
  readonly locationSelected = output<LocationSelection>();

  private readonly googleMapsLoader = inject(GoogleMapsLoaderService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mapEl = viewChild<ElementRef<HTMLDivElement>>('mapEl');

  protected readonly selectedLocation = signal<LocationSelection | null>(null);
  protected readonly loading = signal(true);
  protected readonly resolving = signal(false);
  protected readonly error = signal('');
  protected readonly searchText = signal('');
  protected readonly suggestions = signal<GooglePlaceSuggestion[]>([]);
  protected readonly suggestionsOpen = signal(false);
  protected readonly suggestionsLoading = signal(false);

  private map: GoogleMap | null = null;
  private marker: GoogleMarker | null = null;
  private geocoder: GoogleGeocoder | null = null;
  private listeners: GoogleMapsListener[] = [];
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private searchRequestId = 0;

  constructor() {
    afterNextRender(() => {
      void this.initMap();
    });

    this.destroyRef.onDestroy(() => {
      for (const listener of this.listeners) {
        listener.remove();
      }

      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
    });
  }

  protected useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.error.set('Current location is not available in this browser.');
      return;
    }

    this.resolving.set(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        void this.setSelectedCoordinates(coords, 'Current location');
      },
      () => {
        this.resolving.set(false);
        this.error.set('Could not read current location.');
      },
    );
  }

  protected confirmLocation(): void {
    const location = this.selectedLocation();
    if (!location) {
      this.error.set('Please select a location first.');
      return;
    }

    this.locationSelected.emit(location);
  }

  protected onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value;
    this.searchText.set(query);

    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    if (query.trim().length < 3) {
      this.suggestions.set([]);
      this.suggestionsOpen.set(false);
      this.suggestionsLoading.set(false);
      this.googleMapsLoader.resetAutocompleteSession();
      return;
    }

    this.suggestionsLoading.set(true);
    const requestId = ++this.searchRequestId;
    this.searchTimer = setTimeout(() => {
      void this.loadSuggestions(query, requestId);
    }, 250);
  }

  protected onSearchFocus(): void {
    if (this.suggestions().length > 0) {
      this.suggestionsOpen.set(true);
    }
  }

  protected onSearchBlur(): void {
    setTimeout(() => this.suggestionsOpen.set(false), 150);
  }

  protected selectSuggestion(suggestion: GooglePlaceSuggestion): void {
    this.resolving.set(true);
    this.suggestionsOpen.set(false);
    void this.googleMapsLoader.resolvePlaceSuggestion(suggestion)
      .then((location) => {
        this.applyLocation(location);
        this.searchText.set(location.name ?? location.address);
        this.suggestions.set([]);
        this.suggestionsOpen.set(false);
      })
      .catch((error) => {
        console.warn('Google Maps place could not be resolved.', error);
        this.error.set('Could not read this location. Please choose another result.');
      })
      .finally(() => this.resolving.set(false));
  }

  private async initMap(): Promise<void> {
    try {
      const maps = await this.googleMapsLoader.load();
      const container = this.mapEl()?.nativeElement;
      if (!container) return;

      const initialLocation = this.initialLocation() ?? await this.getCurrentCoordinates() ?? DEFAULT_LOCATION;

      this.map = new maps.Map(container, {
        center: initialLocation,
        zoom: 15,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
      });
      this.marker = new maps.Marker({
        position: initialLocation,
        map: this.map,
        draggable: true,
        title: 'Selected location',
      });
      this.geocoder = new maps.Geocoder();
      this.applyLocation(initialLocation);

      this.listeners.push(
        this.map.addListener('click', (event) => {
          if (event.latLng) {
            void this.setSelectedCoordinates({
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            });
          }
        }),
        this.marker.addListener('dragend', () => {
          const position = this.marker?.getPosition();
          if (position) {
            void this.setSelectedCoordinates({
              lat: position.lat(),
              lng: position.lng(),
            });
          }
        }),
      );

      this.loading.set(false);
    } catch {
      this.loading.set(false);
      this.error.set('Google Maps could not be loaded.');
    }
  }

  private async setSelectedCoordinates(coords: MapCoordinates, name?: string): Promise<void> {
    this.resolving.set(true);
    const address = await this.reverseGeocode(coords);
    this.resolving.set(false);
    this.applyLocation({
      ...coords,
      address,
      name,
    });
  }

  private applyLocation(location: LocationSelection): void {
    const position = { lat: location.lat, lng: location.lng };

    this.selectedLocation.set(location);
    this.error.set('');
    this.marker?.setPosition(position);
    this.map?.setCenter(position);
    this.map?.setZoom(15);
    this.locationChange.emit(location);
  }

  private async loadSuggestions(query: string, requestId: number): Promise<void> {
    try {
      const location = this.selectedLocation();
      const suggestions = await this.googleMapsLoader.fetchPlaceSuggestions(
        query,
        location ? { lat: location.lat, lng: location.lng } : undefined,
      );
      if (requestId !== this.searchRequestId) return;

      this.suggestions.set(suggestions);
      this.suggestionsOpen.set(suggestions.length > 0);
      this.error.set('');
    } catch (error) {
      console.warn('Google Places search request failed.', error);
      this.error.set(getGoogleMapsSearchErrorMessage(error));
    } finally {
      if (requestId === this.searchRequestId) {
        this.suggestionsLoading.set(false);
      }
    }
  }

  private async reverseGeocode(coords: MapCoordinates): Promise<string> {
    if (!this.geocoder) {
      return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
    }

    return new Promise((resolve) => {
      this.geocoder?.geocode({ location: coords }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          resolve(results[0].formatted_address);
          return;
        }

        resolve(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
      });
    });
  }

  private getCurrentCoordinates(): Promise<LocationSelection | null> {
    if (!navigator.geolocation) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current location',
            name: 'Current location',
          });
        },
        () => resolve(null),
        { timeout: 5000 },
      );
    });
  }
}
