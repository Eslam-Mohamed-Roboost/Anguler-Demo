
export interface HotelTripItem {
  tripRequestId: string;
  hotelId?: string;
  hotelName:string;
  tripCode: string;
  guestName: string;
  roomNumber: number;
  driverName: string | null;
  driverAvatarUrl: string | null;
  startLocation: { address: string };
  endLocation: { address: string };
  status: string;
  durationMinutes: number;
  distanceInKm: number;
  fare: number | null;
  commission: number | null;
  currency: string;
  startedAt: string;
  endedAt: string;
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

export interface HotelFinancialsItem {
  hotelId: string;
  hotelName: string;
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
  status: string;
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
  accountHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  bankRoutingName: string;
  payoutCycle: string;
  payoutMethod: string;
  walletAddress: string;
}

export interface WithdrawalDetailsUpdate {
  bankName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
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
