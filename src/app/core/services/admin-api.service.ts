// Admin API wrapper — identical to ApiService but targets the admin base URL
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminApiService extends ApiService {
  override readonly baseUrl = environment.adminApiUrl;
}
