// API Response Interfaces based on Swagger documentation
export interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  error?: Error;
  statusCode: number;
}

export interface Error {
  message?: string;
  code?: string;
  details?: any;
}

// Driver Trips API
export interface DriverTripItemResponse {
  id: string;
  driverId: string;
  customerId: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffLatitude: number;
  dropoffLongitude: number;
  status: number;
  paymentStatus: number;
  distance: number;
  duration: number;
  price: number;
  currency: string;
  createdDate: string;
  completedDate?: string;
  customerName?: string;
  customerPhone?: string;
  customerPicture?: string;
  vehicleType?: string;
  rating?: number;
  driverEarnings?: number;
}

export interface GetDriverTripsResponse {
  items?: DriverTripItemResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Driver Profile API
export interface DriverProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl?: string;
  rating: number;
  totalTrips: number;
  totalEarnings: number;
  isOnline: boolean;
  isVerified: boolean;
  vehicleCount: number;
  averageResponseTime: number;
  completionRate: number;
  joinedDate: string;
  lastActiveDate?: string;
}

// Driver Vehicle API
export interface DriverVehicleDto {
  id: string;
  name: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vehicleType: string;
  kmPrice: number;
  images?: string[];
  licensePhotos?: string[];
  registrationDocuments?: string[];
  isActive: boolean;
  createdDate: string;
}

export interface GetDriverVehiclesResponse {
  vehicles?: DriverVehicleDto[];
}

// Request/Query Interfaces
export interface GetDriverTripsQuery {
  TripStatus?: number;
  DateRangeStart?: string;
  DateRangeEnd?: string;
  PaymentStatus?: number;
  PageNumber?: number;
  PageSize?: number;
}

// Trip Status Enum (based on typical ride-sharing app)
export enum TripStatus {
  Pending = 0,
  Accepted = 1,
  Arrived = 2,
  InProgress = 3,
  Completed = 4,
  Cancelled = 5,
  Rejected = 6
}

// Payment Status Enum
export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Failed = 2,
  Refunded = 3
}
