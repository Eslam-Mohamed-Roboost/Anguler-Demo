import { Injectable, inject } from '@angular/core';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { Result } from '../../../core/models/result.model';
import { SKIP_ERROR_NOTIFICATION } from '../../../core/tokens/skip-error-notification.token';

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
  cityName?: string;
  locationUrl: string;
  logoUrl: string;
  commissionRate: number;
  isActive: boolean;
  isVerified: boolean;
  code: string;
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

export interface UserProfileData {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  userType: number;
  isDeleted: boolean;
  isActive: boolean;
  configuration: UserProfileConfiguration | null;
}

export interface WithdrawalDetailsData {
  id?: string;
  bankAccountHolderName?: string;
  accountHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  bankRoutingNumber?: string;
  payoutCycle?: string | null;
  payoutMethod?: string | null;
  walletAddress?: string | null;
}

export interface WithdrawalDetailsUpdate {
  bankAccountHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  bankRoutingNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  changePassword(payload: ChangePasswordRequest): Observable<Result<void>> {
    console.log('ProfileService.changePassword called with payload:', payload);
    return this.api.put<void>('/users/change-password', payload);
  }

  getHotelProfile(): Observable<Result<HotelProfileData>> {
    return this.api.get<UserProfileData>('/users/profile').pipe(
      map(result => ({
        ...result,
        data: result.data ? this.toHotelProfileData(result.data) : null,
      })),
    );
  }

  updateHotelProfile(data: HotelProfileData): Observable<Result<HotelProfileData>> {
    return this.api.put<HotelProfileData>('/hotels/profile', data);
  }

  getWithdrawalDetails(): Observable<Result<WithdrawalDetailsData>> {
    const context = new HttpContext().set(SKIP_ERROR_NOTIFICATION, true);

    return this.api.get<WithdrawalDetailsData>('/hotels/withdrawal-details', undefined, context).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          return of({
            isSuccess: true,
            data: this.emptyWithdrawalDetails(),
            error: null,
            statusCode: 200,
          });
        }

        throw error;
      }),
    );
  }

  updateWithdrawalDetails(data: WithdrawalDetailsUpdate): Observable<Result<WithdrawalDetailsData>> {
    return this.api.put<WithdrawalDetailsData>('/hotels/withdrawal-details', data);
  }

  private toHotelProfileData(profile: UserProfileData): HotelProfileData {
    const configuration = profile.configuration;

    return {
      id: profile.id,
      hotelName: profile.userName || profile.email,
      address: configuration?.address ?? '',
      phoneNumber: profile.phoneNumber,
      email: profile.email,
      cityId: configuration?.cityId ?? '',
      cityName: configuration?.cityName ?? '',
      locationUrl: configuration?.locationUrl ?? '',
      logoUrl: configuration?.logoUrl ?? '',
      commissionRate: configuration?.commissionRate ?? 0,
      isActive: profile.isActive,
      isVerified: configuration?.isVerified ?? false,
      code: configuration?.code ?? '',
    };
  }

  private emptyWithdrawalDetails(): WithdrawalDetailsData {
    return {
      accountHolderName: '',
      bankName: '',
      bankAccountNumber: '',
      bankRoutingNumber: '',
    };
  }
}
