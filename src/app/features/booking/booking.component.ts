import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapComponent } from '../../shared/components/map/map.component';
import { WeatherWidgetComponent } from '../../shared/components/weather-widget/weather-widget.component';

interface CarType {
  id: string;
  label: string;
  image: string;
}

@Component({
  selector: 'app-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MapComponent, WeatherWidgetComponent],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class BookingComponent {
  readonly carTypes: CarType[] = [
    { id: 'premium', label: 'Premium', image: 'assets/booking/car-premium.png' },
    { id: 'van', label: 'Van', image: 'assets/booking/car-van.png' },
    { id: 'comfort', label: 'Comfort', image: 'assets/booking/car-comfort.png' },
    { id: 'pet', label: 'Pet', image: 'assets/booking/car-pet.png' },
    { id: 'taxi', label: 'Taxi', image: 'assets/booking/car-taxi.png' },
    { id: 'kids', label: 'Kids Seat', image: 'assets/booking/car-kids.png' },
  ];

  readonly selectedCar = signal('van');
  readonly manyBags = signal(true);
  readonly destination = signal('');
  readonly clientName = signal('');
  readonly roomNo = signal('');

  readonly mapCenter = signal<[number, number]>([40.7128, -74.006]);
  readonly weatherLat = signal(40.7128);
  readonly weatherLng = signal(-74.006);

  selectCar(id: string): void {
    this.selectedCar.set(id);
  }

  onMapCenterChange(center: { lat: number; lng: number }): void {
    this.weatherLat.set(center.lat);
    this.weatherLng.set(center.lng);
  }
}
