export interface PersonCard {
  name: string;
  role: string;
  rating: number;
  status: string;
  phoneNumber: string;
  email: string;
  emergencyCallsCount: number;
}

export interface TripDetailsInfo {
  tripStatus: number;
  tripId: string;
  tripCode: string;
  pickupLocation: string;
  destinations: string[];
  tripFare: number;
  driverProfit: number;
  appProfit: number;
  paymentMethod: string;
  carType: string;
  tripDuration: number;
  tripDistance: number;
  isHotelTrip: boolean;
  hotelName: string;
  guestName: string;
  roomNumber: number;
}

export interface TripDetailsResponse {
  passengerCard: PersonCard;
  driverCard: PersonCard;
  tripDetails: TripDetailsInfo;
}

export function getTripStatusLabel(status: number): string {
  switch (status) {
    case 0: return 'Pending';
    case 1: return 'Accepted';
    case 2: return 'Arrived';
    case 3: return 'In Progress';
    case 4: return 'Completed';
    case 5: return 'Cancelled';
    case 6: return 'Rejected';
    default: return 'Unknown';
  }
}

export function getTripStatusVariant(status: number): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  switch (status) {
    case 4: return 'success';
    case 5:
    case 6: return 'danger';
    case 3: return 'info';
    case 0:
    case 1:
    case 2: return 'warning';
    default: return 'neutral';
  }
}
