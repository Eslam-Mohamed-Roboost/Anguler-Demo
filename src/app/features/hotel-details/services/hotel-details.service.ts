import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { 
  DriverProfileResponse,
  GetDriverTripsResponse,
  GetDriverTripsQuery,
  DriverTripItemResponse,
  GetDriverVehiclesResponse,
  ApiResponse
} from './api.types';

@Injectable({
  providedIn: 'root',
})
export class HotelDetailsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly useMockData = true; // Toggle for mock vs real API

  constructor() {
    console.log('🏨 HotelDetailsService initialized - Using mock data:', this.useMockData);
  }

  /* ── Driver Profile ───────────────────────────────────── */
  getDriverProfile(): Observable<ApiResponse<DriverProfileResponse>> {
    if (this.useMockData) {
      console.log('📊 Using mock driver profile data');
      return of(this.createMockDriverProfile()).pipe(delay(500));
    }

    console.log('📡 Fetching driver profile from API');
    return this.http.get<ApiResponse<DriverProfileResponse>>(`${this.baseUrl}/drivers/profile`);
  }

  /* ── Driver Trips ─────────────────────────────────────── */
  getDriverTrips(query?: GetDriverTripsQuery): Observable<GetDriverTripsResponse> {
    if (this.useMockData) {
      console.log('📊 Using mock driver trips data');
      return of(this.createMockDriverTrips(query)).pipe(delay(800));
    }

    const params = new URLSearchParams();
    if (query) {
      if (query.PageNumber) params.append('PageNumber', query.PageNumber.toString());
      if (query.PageSize) params.append('PageSize', query.PageSize.toString());
      if (query.TripStatus !== undefined) params.append('TripStatus', query.TripStatus.toString());
      if (query.DateRangeStart) params.append('DateRangeStart', query.DateRangeStart);
      if (query.DateRangeEnd) params.append('DateRangeEnd', query.DateRangeEnd);
      if (query.PaymentStatus !== undefined) params.append('PaymentStatus', query.PaymentStatus.toString());
    }

    console.log('📡 Fetching driver trips from API');
    return this.http.get<GetDriverTripsResponse>(`${this.baseUrl}/drivers/trips?${params}`);
  }

  /* ── Driver Vehicles ─────────────────────────────────── */
  getDriverVehicles(): Observable<GetDriverVehiclesResponse> {
    if (this.useMockData) {
      console.log('📊 Using mock driver vehicles data');
      return of(this.createMockDriverVehicles()).pipe(delay(300));
    }

    console.log('📡 Fetching driver vehicles from API');
    return this.http.get<GetDriverVehiclesResponse>(`${this.baseUrl}/drivers/vehicles`);
  }

  /* ── Mock Data Generators ───────────────────────────── */

  private createMockDriverProfile(): ApiResponse<DriverProfileResponse> {
    return {
      isSuccess: true,
      data: {
        id: 'driver-123',
        firstName: 'Ahmed',
        lastName: 'Mohamed',
        email: 'ahmed.mohamed@example.com',
        phoneNumber: '+20 123 456 7890',
        rating: 4.8,
        totalTrips: 1247,
        totalEarnings: 45678.90,
        isOnline: true,
        isVerified: true,
        vehicleCount: 2,
        averageResponseTime: 180,
        completionRate: 96.5,
        joinedDate: '2022-03-15T00:00:00Z'
      },
      statusCode: 200
    };
  }

  private createMockDriverTrips(query?: GetDriverTripsQuery): GetDriverTripsResponse {
    const mockTrips: DriverTripItemResponse[] = [
      {
        id: 'trip-001',
        driverId: 'driver-123',
        customerId: 'customer-001',
        pickupAddress: 'Cairo International Airport',
        dropoffAddress: 'Giza Pyramids',
        pickupLatitude: 30.1219,
        pickupLongitude: 31.4334,
        dropoffLatitude: 29.9792,
        dropoffLongitude: 31.1342,
        status: 1, // Completed
        paymentStatus: 1, // Paid
        distance: 42.5,
        duration: 75,
        price: 280.00,
        currency: 'EGP',
        createdDate: '2024-02-26T14:30:00Z',
        completedDate: '2024-02-26T15:45:00Z',
        customerName: 'Sarah Johnson',
        customerPhone: '+20 987 654 3210',
        rating: 5,
        driverEarnings: 224.00
      },
      {
        id: 'trip-002',
        driverId: 'driver-123',
        customerId: 'customer-002',
        pickupAddress: 'Downtown Cairo',
        dropoffAddress: 'Nile City',
        pickupLatitude: 30.0444,
        pickupLongitude: 31.2357,
        dropoffLatitude: 30.0484,
        dropoffLongitude: 31.2334,
        status: 1, // Completed
        paymentStatus: 1, // Paid
        distance: 8.2,
        duration: 30,
        price: 65.00,
        currency: 'EGP',
        createdDate: '2024-02-26T16:15:00Z',
        completedDate: '2024-02-26T16:45:00Z',
        customerName: 'Michael Chen',
        customerPhone: '+20 555 123 4567',
        rating: 4,
        driverEarnings: 52.00
      },
      {
        id: 'trip-003',
        driverId: 'driver-123',
        customerId: 'customer-003',
        pickupAddress: 'Cairo Opera House',
        dropoffAddress: 'Khan el-Khalili',
        pickupLatitude: 30.0419,
        pickupLongitude: 31.2156,
        dropoffLatitude: 30.0478,
        dropoffLongitude: 31.2625,
        status: 2, // In Progress
        paymentStatus: 0, // Pending
        distance: 12.8,
        duration: 45,
        price: 95.00,
        currency: 'EGP',
        createdDate: '2024-02-26T18:00:00Z',
        customerName: 'Fatima Al-Rashid',
        customerPhone: '+20 222 333 4444',
        rating: undefined,
        driverEarnings: undefined
      },
      {
        id: 'trip-004',
        driverId: 'driver-123',
        customerId: 'customer-004',
        pickupAddress: 'Egyptian Museum',
        dropoffAddress: 'Zamalek District',
        pickupLatitude: 30.0478,
        pickupLongitude: 31.2336,
        dropoffLatitude: 30.0741,
        dropoffLongitude: 31.2132,
        status: 0, // Pending
        paymentStatus: 0, // Pending
        distance: 6.5,
        duration: 25,
        price: 48.00,
        currency: 'EGP',
        createdDate: '2024-02-26T19:30:00Z',
        customerName: 'David Wilson',
        customerPhone: '+20 777 888 9999',
        rating: undefined,
        driverEarnings: undefined
      }
    ];

    // Filter by status if provided
    let filteredTrips = mockTrips;
    if (query?.TripStatus !== undefined) {
      filteredTrips = mockTrips.filter(trip => trip.status === query.TripStatus);
    }

    // Apply pagination
    const pageNumber = query?.PageNumber || 1;
    const pageSize = query?.PageSize || 10;
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTrips = filteredTrips.slice(startIndex, endIndex);

    return {
      items: paginatedTrips,
      pageNumber,
      pageSize,
      totalCount: filteredTrips.length,
      totalPages: Math.ceil(filteredTrips.length / pageSize)
    };
  }

  private createMockDriverVehicles(): GetDriverVehiclesResponse {
    return {
      vehicles: [
        {
          id: 'vehicle-001',
          name: 'Toyota Camry',
          model: 'Camry',
          year: 2022,
          color: 'Silver',
          licensePlate: 'ABC-1234',
          vehicleType: 'Sedan',
          kmPrice: 5.50,
          isActive: true,
          createdDate: '2022-03-15T00:00:00Z'
        },
        {
          id: 'vehicle-002',
          name: 'Honda CR-V',
          model: 'CR-V',
          year: 2023,
          color: 'Blue',
          licensePlate: 'XYZ-5678',
          vehicleType: 'SUV',
          kmPrice: 7.25,
          isActive: false,
          createdDate: '2023-01-20T00:00:00Z'
        }
      ]
    };
  }

  /* ── Helper Methods ─────────────────────────────────── */

  convertApiProfileToHotelInfo(profile: ApiResponse<DriverProfileResponse>): any {
    if (!profile.isSuccess || !profile.data) {
      return null;
    }

    const data = profile.data;
    return {
      name: `${data.firstName} ${data.lastName}`,
      address: 'Cairo, Egypt', // Mock address
      phone: data.phoneNumber,
      email: data.email,
      rating: data.rating,
      totalTrips: data.totalTrips,
      joinDate: data.joinedDate,
      status: data.isOnline ? 'active' : 'inactive'
    };
  }

  convertApiTripToTripRecord(trip: DriverTripItemResponse): any {
    return {
      id: trip.id,
      customerName: trip.customerName,
      pickupLocation: trip.pickupAddress,
      dropoffLocation: trip.dropoffAddress,
      pickupTime: trip.createdDate,
      dropoffTime: trip.completedDate,
      distance: trip.distance,
      fare: trip.price,
      status: this.getTripStatusText(trip.status),
      paymentMethod: this.getPaymentStatusText(trip.paymentStatus),
      rating: trip.rating,
      customerPhone: trip.customerPhone
    };
  }

  getTripStatusText(status: number): string {
    switch (status) {
      case 0: return 'pending';
      case 1: return 'completed';
      case 2: return 'in_progress';
      case 3: return 'cancelled';
      default: return 'unknown';
    }
  }

  getPaymentStatusText(paymentMethod: number): string {
    switch (paymentMethod) {
      case 1: return 'credit_card';
      case 2: return 'cash';
      case 3: return 'digital_wallet';
      default: return 'unknown';
    }
  }
}
