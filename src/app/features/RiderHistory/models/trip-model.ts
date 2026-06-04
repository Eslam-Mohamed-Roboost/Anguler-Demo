export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

 



export interface HotelRequestItem {
  tripRequestId: string
  tripId: string
  tripCode: any
  guestName: any
  roomNumber: any
  driverName: string
  driverAvatarUrl: any
  startLocation: StartLocation
  endLocation: EndLocation
  status: string
  requestStatusString?: string
  requestStatusEnum?: number | null
  tripRequestStatusString?: string
  tripRequestStatusEnum?: number | null
  tripStatusString?: string
  tripStatusEnum?: number | null
  isScheduled?: boolean
  durationMinutes: any
  distanceInKm: any
  fare: number
  commission: any
  currency: string
  startedAt: any
  endedAt: any
  scheduledAt?: string | null
  requestedAt: string
}

export interface StartLocation {
  latitude: number
  longitude: number
  address: string
}

export interface EndLocation {
  latitude: number
  longitude: number
  address: string
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
  search?: string;
  status?: string;
}

export interface TripRequestStatusItem {
  id: number;
  name: string;
}

export interface TripRequestStatusesResponse {
  status: TripRequestStatusItem[];
}
