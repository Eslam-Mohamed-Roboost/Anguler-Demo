import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { Result } from '../../../core/models/result.model';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  changePassword(payload: ChangePasswordRequest): Observable<Result<void>> {
    return this.api.put<void>('/users/change-password', payload);
  }
}
