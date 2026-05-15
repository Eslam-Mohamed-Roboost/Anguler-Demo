import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { Result } from '../../../core/models/result.model';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface HotelProfileData {
  id: string;
  hotelName: string;
  address: string;
  phoneNumber: string;
  email: string;
  cityId: string;
  locationUrl: string;
  logoUrl: string;
  commissionRate: number;
  isActive: boolean;
  isVerified: boolean;
}

export interface WithdrawalDetailsData {
  id?: string;
  bankAccountHolderName?: string;
  accountHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  payoutCycle?: string | null;
  payoutMethod?: string | null;
  walletAddress?: string | null;
}

export interface WithdrawalDetailsUpdate {
  bankAccountHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  changePassword(payload: ChangePasswordRequest): Observable<Result<void>> {
    console.log('ProfileService.changePassword called with payload:', payload);
    return this.api.put<void>('/users/change-password', payload);
  }

  getHotelProfile(): Observable<Result<HotelProfileData>> {
    return this.api.get<HotelProfileData>('/hotels/profile');
  }

  updateHotelProfile(data: HotelProfileData): Observable<Result<HotelProfileData>> {
    return this.api.put<HotelProfileData>('/hotels/profile', data);
  }

  getWithdrawalDetails(): Observable<Result<WithdrawalDetailsData>> {
    return this.api.get<WithdrawalDetailsData>('/hotels/withdrawal-details');
  }

  updateWithdrawalDetails(data: WithdrawalDetailsUpdate): Observable<Result<WithdrawalDetailsData>> {
    return this.api.put<WithdrawalDetailsData>('/hotels/withdrawal-details', data);
  }
}
