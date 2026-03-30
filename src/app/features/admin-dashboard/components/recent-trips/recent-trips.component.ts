import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TripStatus = 'Active' | 'Completed' | 'Canceled';

export interface RecentTrip {
  id: string;
  status: TripStatus;
  price: number;
  driverName: string;
  passengerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  timeAgo: string;
}

@Component({
  selector: 'app-recent-trips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recent-trips.component.html',
  styleUrl: './recent-trips.component.css',
})
export class RecentTripsComponent {
  readonly trips = input<RecentTrip[]>([]);

  statusClass(status: TripStatus): string {
    switch (status) {
      case 'Active': return 'bg-emerald-500 text-white';
      case 'Completed': return 'bg-blue-500 text-white';
      case 'Canceled': return 'bg-red-500 text-white';
    }
  }
}
