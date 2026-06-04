
export interface HotelTripItem {
  tripRequestId: string;
  tripId: string | null;
  hotelId?: string;
  hotelName:string;
  hotelPhone?: string | null;
  tripCode: string | null;
  guestName: string;
  roomNumber: number;
  notes: string | null;
  placeTypeId: string | null;
  placeTypeName: string | null;
  otherPlaceText: string | null;
  driverName: string | null;
  driverAvatarUrl: string | null;
  startLocation: { latitude?: number; longitude?: number; address: string };
  endLocation: { latitude?: number; longitude?: number; address: string };
  status?: string;
  requestStatusString: string;
  requestStatusEnum: number | null;
  tripRequestStatusString?: string;
  tripRequestStatusEnum?: number | null;
  tripStatusString: string;
  tripStatusEnum: number | null;
  isScheduled?: boolean;
  durationMinutes: number | null;
  distanceInKm: number | null;
  fare: number | null;
  commission: number | null;
  currency: string;
  startedAt: string | null;
  endedAt: string | null;
  scheduledAt?: string | null;
  requestedAt: string | null;
}

export interface HotelProfileResponse {
  hotelId: string;
  hotelName: string;
  address: string;
  phoneNumber: string;
  email: string;
  imageUrl: string | null;
  isBlocked: boolean;
}

export interface HotelTripsResponse {
  hotelId: string;
  items: HotelTripItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface TripRequestStatusItem {
  id: number;
  name: string;
}

export interface TripRequestStatusesResponse {
  status: TripRequestStatusItem[];
}

export interface HotelApiItem {
  id: string;
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
  code: string;
  isBlocked: boolean;
}

export interface UserProfileConfiguration {
  cityId: string;
  cityName: string;
  address: string;
  locationUrl: string;
  logoUrl: string;
  commissionRate: number;
  isVerified: boolean;
  isBlocked: boolean;
  placeTypeId: string;
  placeTypeName: string;
  otherPlaceText: string;
  code: string;
  createdDate: string;
}

export interface UserProfileResponse {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  userType: number;
  isDeleted: boolean;
  isActive: boolean;
  configuration: UserProfileConfiguration | null;
}

export interface HotelFinancialsItem {
  hotelId: string;
  code?: string | null;
  hotelName: string;
  hotelPhone: string;
  isActive: boolean;
  year: number;
  month: number;
  totalTrips: number;
  totalFare: number;
  commissionRate: number;
  linesProfits: number;
  hotelProfits: number;
  payoutId: string;
  monthlyDues: number;
  status?: string;
  statusString?: string;
  statusEnum?: number | null;
}

export interface HotelsListResponse {
  items: HotelFinancialsItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface WithdrawalDetailsResponse {
  id: string;
  bankAccountHolderName?: string;
  accountHolderName?: string;
  bankName: string;
  bankAccountNumber: string;
  bankRoutingNumber?: string;
  bankRoutingName?: string;
  payoutCycle?: string;
  payoutMethod?: string;
  walletAddress?: string;
}

export interface WithdrawalDetailsUpdate {
  bankAccountHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  bankRoutingNumber?: string;
}

export interface DashboardStatsResponse {
  totalHotels: number;
  totalRevenue: number;
  hotelsCommission: number;
  linesNetProfit: number;
  activeTrips: number;
  scheduledTrips: number;
  completedTrips: number;
  canceledTrips: number;
}

export interface HotelKpiResponse {
  commissionPercentage: CommissionPercentage
  hotelRevenue: HotelRevenue
  hotelCommission: HotelCommission
  linesNetProfit: LinesNetProfit
  activeTrips: ActiveTrips
  scheduledTrips: ScheduledTrips
  completedTrips: CompletedTrips
  canceledTrips: CanceledTrips
}
export interface CommissionPercentage {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface HotelRevenue {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface HotelCommission {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface LinesNetProfit {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface ActiveTrips {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface ScheduledTrips {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface CompletedTrips {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface CanceledTrips {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}
