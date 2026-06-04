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
  startDate?: string;
  endedAt: string;
  fare: number;
  hotelCommission: number;
  platformCommission: number;
  cumulativeProfit?: number;
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
  searchTerm?: string;
}

export interface FinancialReportTripDetails {
  tripId: string;
  tripCode: string;
  driverName: string;
  guestName: string;
  roomNumber: number;
  startLocation: GeoLocation;
  endLocation: GeoLocation;
  durationMinutes: number;
  distanceKm: number;
  startDate: string;
  endDate: string;
  tripProfit: number;
  cumulativeProfit: number;
  currency: string;
}

export interface FinancialReportItem {
  itemType: number;
  sequenceDate: string;
  tripDetails: FinancialReportTripDetails | null;
  bannerDetails: {
    payoutStatus: number;
    displayMessage: string;
  } | null;
}

export interface FinancialReportResponse {
  items: FinancialReportItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
