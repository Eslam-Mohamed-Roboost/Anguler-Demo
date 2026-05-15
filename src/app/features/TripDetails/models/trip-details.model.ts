export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface TripDriver {
  driverId: string;
  fullName: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  rating: number;
}

export interface HotelInfo {
  id: string;
  code: string;
  hotelName: string;
  cityId: string;
  address: string;
  locationUrl: string;
  phoneNumber: string;
  email: string;
  logoUrl: string;
  commissionRate: number;
  isActive: boolean;
  isVerified: boolean;
}

export interface TripDetailsResponse {
  tripRequestId: string;
  tripId: string | null;
  tripCode: string | null;
  unifiedStatus: string;
  startLocation: Location;
  endLocation: Location;
  guestName: string;
  roomNumber: number;
  isHotelRequest: boolean;
  hotelId: string | null;
  hotel?: HotelInfo | null;
  driver: TripDriver | null;
  estimatedPrice: number;
  actualFare: number | null;
  tips: number | null;
  currency: string;
  paymentMethodType: string;
  isScheduled: boolean;
  scheduledAt: string | null;
  requestedAt: string;
  startedAt: string | null;
  endedAt: string | null;
  arrivedAt: string | null;
  durationMinutes: number | null;
  distanceInKm: number | null;
  notes?: string;
  specialRequests?: string;
}

export function getTripStatusLabel(status: string): string {
  switch (status) {
    case 'Pending': return 'Pending';
    case 'Accepted': return 'Accepted';
    case 'Arrived': return 'Arrived';
    case 'InProgress': return 'In Progress';
    case 'Completed': return 'Completed';
    case 'Canceled':
    case 'Cancelled':
    case 'CanceledByDriver':
    case 'CancelledByDriver':
    case 'CanceledByPassenger':
    case 'CancelledByPassenger':
    case 'CanceledByHotel':
    case 'CancelledByHotel':
      return 'Cancelled';
    case 'Rejected': return 'Rejected';
    default: return status;
  }
}

export function getTripStatusVariant(status: string): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  switch (status) {
    case 'Completed': return 'success';
    case 'Canceled':
    case 'Cancelled':
    case 'CanceledByDriver':
    case 'CancelledByDriver':
    case 'CanceledByPassenger':
    case 'CancelledByPassenger':
    case 'CanceledByHotel':
    case 'CancelledByHotel':
    case 'Rejected': return 'danger';
    case 'InProgress': return 'info';
    case 'Pending':
    case 'Accepted':
    case 'Arrived': return 'warning';
    default: return 'neutral';
  }
}
