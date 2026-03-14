import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Result } from '../../../../core/models/result.model';

@Injectable({ providedIn: 'root' })
export class OtpService extends ApiService {
  resend(email: string): Observable<Result<string>> {
    return this.post<string>('/otps/resend', { email });
  }

  validate(userId: string, otp: string): Observable<Result<boolean>> {
    return this.post<boolean>('/otps/validate', { userId, otp });
  }

  resetPassword(userId: string, newPassword: string): Observable<Result<boolean>> {
    return this.put<boolean>('/users/reset-password', { userId, newPassword });
  }
}
