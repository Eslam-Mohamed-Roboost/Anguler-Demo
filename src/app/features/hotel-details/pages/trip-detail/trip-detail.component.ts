import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
 
import type { HotelInfo } from '../../types/hotel-details.types';

export interface TripDetail {
  tripId: string;
  guestName: string;
  roomNo: string;
  destinations: string;
  fare: number;
  hotelProfits: number;
  commissionRate: number;
  startDate: string;
  endDate?: string;
  tripRate?: number;
  status: 'active' | 'completed' | 'cancelled' | 'scheduled' | 'pending';
}


@Component({
  selector: 'app-trip-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './trip-detail.component.html',
  styleUrl: './trip-detail.component.css',
})
export class TripDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly renderer = inject(Renderer2);

  readonly hotelId = signal('21453');
  readonly tripId = signal('21ST425');

  readonly hotel = signal<HotelInfo>({
    id: '1',
    name: 'Massa Hotel',
    address: '12 Tarq st. Jadida Square, Egypt.',
    phone: '00215236582458',
    email: 'hello@gmail.com',
    imageUrl: '',
  });

  readonly trip = signal<TripDetail>({
    tripId: '21ST425',
    guestName: 'Hisham Mausa',
    roomNo: '124',
    destinations: 'User entered text',
    fare: 20,
    hotelProfits: 2,
    commissionRate: 2,
    startDate: '2024-01-15 14:30',
    endDate: undefined,
    tripRate: undefined,
    status: 'active',
  });

  readonly statusLabel = computed(() => {
    const map: Record<string, string> = {
      active: 'Active Trip',
      completed: 'Completed',
      cancelled: 'Cancelled',
      scheduled: 'Scheduled',
      pending: 'Pending',
    };
    return map[this.trip().status] ?? this.trip().status;
  });

  readonly statusBadgeClass = computed(() => {
    const map: Record<string, string> = {
      active: 'text-status-scheduled bg-status-scheduled-bg',
      pending: 'text-status-scheduled bg-status-scheduled-bg',
      completed: 'text-status-completed bg-status-completed-bg',
      cancelled: 'text-status-cancelled bg-status-cancelled-bg',
      scheduled: 'text-status-active bg-status-active-bg',
    };
    return map[this.trip().status] ?? '';
  });

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'hotel-details-active');
    const hotelId = this.route.snapshot.paramMap.get('id');
    const tripId = this.route.snapshot.paramMap.get('tripId');
    if (hotelId) this.hotelId.set(hotelId);
    if (tripId) this.tripId.set(tripId);
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'hotel-details-active');
  }

  onHotelDelete(): void {}
}
