export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface HotelRequestItem {
  tripRequestId: string;
  tripCode: string;
  guestName: string;
  roomNumber: number;
  driverName: string;
  driverAvatarUrl: string;
  startLocation: Location;
  endLocation: Location;
  status: string;
  durationMinutes: number;
  distanceInKm: number;
  fare: number;
  commission: number;
  currency: string;
  startedAt: string;
  endedAt: string;
  requestedAt: string;
}

export interface HotelRequestsHistoryResponse {
  items: HotelRequestItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface HotelRequestsQuery {
  pageNumber: number;
  pageSize: number;
}
