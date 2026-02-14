/**
 * Shared reusable map — renders an interactive Leaflet/OpenStreetMap map.
 *
 * Usage:
 *   <app-map [center]="[40.7128, -74.006]" [zoom]="13" height="400px" />
 *   <app-map [center]="[51.505, -0.09]" [zoom]="10" tileStyle="default" />
 *
 * Features:
 *   - SSR-safe (initializes only in the browser via afterNextRender)
 *   - Multiple tile styles: voyager (colorful), default (standard OSM)
 *   - Configurable center, zoom, and height
 *   - Emits mapReady with the Leaflet map instance
 *   - Emits centerChange when the user pans the map
 */
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

@Component({
  selector: 'app-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  /** Map center as [latitude, longitude] */
  readonly center = input<[number, number]>([40.7128, -74.006]);

  /** Initial zoom level */
  readonly zoom = input(13);

  /** CSS height for the map container */
  readonly height = input('400px');

  /** Tile style: 'voyager' for colorful CartoDB tiles, 'default' for standard OSM */
  readonly tileStyle = input<'voyager' | 'default'>('voyager');

  /** Whether the map is interactive (dragging, zooming, scrolling). Defaults to true. */
  readonly interactive = input(true);

  /** Emitted when map is ready with the Leaflet map instance */
  readonly mapReady = output<unknown>();

  /** Emitted when the map center changes (user pans) */
  readonly centerChange = output<{ lat: number; lng: number }>();

  private readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapEl');
  private mapInstance: LeafletMap | null = null;
  private markerInstance: LeafletMarker | null = null;
  private leafletPromise: Promise<typeof import('leaflet')> | null = null;

  constructor() {
    // Start loading Leaflet immediately (don't wait for DOM)
    if (isPlatformBrowser(this.platformId)) {
      this.leafletPromise = import('leaflet');
    }

    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initMap();
      }
    });

    // Watch for center input changes and pan the map + move marker
    effect(() => {
      const [lat, lng] = this.center();
      if (this.mapInstance) {
        this.mapInstance.setView([lat, lng], this.zoom());
        if (this.markerInstance) {
          this.markerInstance.setLatLng([lat, lng]);
        }
      }
    });

    this.destroyRef.onDestroy(() => {
      if (this.mapInstance) {
        this.mapInstance.remove();
      }
    });
  }

  private async initMap(): Promise<void> {
    const L = await this.leafletPromise!;

    const container = this.mapContainer()?.nativeElement;
    if (!container) return;

    const [lat, lng] = this.center();
    const isInteractive = this.interactive();
    const map = L.map(container, {
      center: [lat, lng],
      zoom: this.zoom(),
      zoomControl: isInteractive,
      attributionControl: true,
      dragging: isInteractive,
      touchZoom: isInteractive,
      doubleClickZoom: isInteractive,
      scrollWheelZoom: isInteractive,
      boxZoom: isInteractive,
      keyboard: isInteractive,
      fadeAnimation: isInteractive,
      zoomAnimation: isInteractive,
    });

    // Choose tile layer based on style
    const tileUrl =
      this.tileStyle() === 'voyager'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution =
      this.tileStyle() === 'voyager'
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
    }).addTo(map);

    // Fix Leaflet icon paths (common issue with bundlers)
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;

    // Add a marker at center
    this.markerInstance = L.marker([lat, lng]).addTo(map);

    // Emit center changes on map move
    map.on('moveend', () => {
      const c = map.getCenter();
      this.centerChange.emit({ lat: c.lat, lng: c.lng });
    });

    this.mapInstance = map;
    this.mapReady.emit(map);

    // Force resize — call twice to ensure tiles fill after layout settles
    map.invalidateSize();
    setTimeout(() => map.invalidateSize(), 200);
  }
}
