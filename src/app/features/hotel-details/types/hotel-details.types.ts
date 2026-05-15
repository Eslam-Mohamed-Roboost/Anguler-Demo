export interface HotelInfo {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  imageUrl?: string;
  isBlocked: boolean;
}

export interface HotelStatistics {
  totalBookings: number;
  activeTrips: number;
  totalRevenue: number;
  occupancyRate: number;
  averageRating: number;
  totalGuests: number;
  completedTrips: number;
  pendingRequests: number;
}

export interface HotelDetails {
  hotel: HotelInfo;
  statistics: HotelStatistics;
}

export interface TripRecord {
  id: string;
  hotelId?: string;
  tripCode?: string;
  tripId?: string;
  customerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  date?: string;
  status: 'completed' | 'active' | 'pending' | 'cancelled' | 'scheduled';
  tripStatus: string;
  tripStatusKey: string;
  requestStatus: string;
  requestStatusKey: string;
  price: number;
  currency: string;
  distance: number | null;
  duration: number | null;
  rating?: number;
  paymentStatus: string;
  customerPhone?: string;
  vehicleType?: string;
  driverEarnings?: number;
  hotelName?: string;
  hotelPhone?: string;
  driverName?: string;
  driverId?: string;
  room?: string;
  commission?: number;
  endDate?: string | null;
  requestedAt?: string | null;
  notes?: string | null;
  placeTypeName?: string | null;
  otherPlaceText?: string | null;
}


export interface HotelFormData {
  name: string;
  address: string;
  email: string;
  phone: string;
  hotelCode: string;
  joiningDate: string;
}

export interface WithdrawalFormData {
  accountHolderName: string;
  bankName: string;
  iban: string;
  swiftCode: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  headerClass?: string;
  cellClass?: string;
}

export interface HotelRecord {
  id: string;
  code: string;
  displayId: string;
  hotelName: string;
  hotelStatus: 'active' | 'suspended';
  totalTrips: number;
  hotelComm: string;
  hotelProfits: string;
  linesProfits: string;
  monthlyDues: string;
  settlementStatus: 'in-progress' | 'settled';
  settlementAmount: string;
}

export interface TripSearchFilters {
  status?: string;
  driver?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
