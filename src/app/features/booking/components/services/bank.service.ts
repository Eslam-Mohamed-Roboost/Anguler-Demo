import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Result } from '../../../../core/models/result.model';

export interface Bank {
  id: string;
  name: string;
}

export interface BanksResponse {
  banks: Bank[];
}

@Injectable({ providedIn: 'root' })
export class BankService extends ApiService {
  getBanks(): Observable<Result<BanksResponse>> {
    return this.get<BanksResponse>('/banks');
  }
}
