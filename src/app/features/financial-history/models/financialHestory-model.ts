export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface FinancialHistoryItem {
  tripId: string;
  tripCode: string;
  guestName: string;
  roomNumber: number;
  driverName: string;
  hotelName: string;
  startLocation: GeoLocation;
  endLocation: GeoLocation;
  durationMinutes: number;
  distanceKm: number;
  endedAt: string;
  fare: number;
  hotelCommission: number;
  platformCommission: number;
  driverPayout: number;
  currency: string;
}

export interface FinancialHistoryResponse {
  items: FinancialHistoryItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface FinancialHistoryQuery {
  pageNumber: number;
  pageSize: number;
  fromDate?: string;
  toDate?: string;
}
