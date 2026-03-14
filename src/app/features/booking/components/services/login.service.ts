import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import { Result } from '../../../../core/models/result.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginData {
  token: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService extends ApiService {
  readonly isLoggedIn = signal(!!localStorage.getItem('userToken'));

  login(credentials: LoginRequest): Observable<Result<LoginData>> {
    return this.post<LoginData>('/users/login', credentials);
  }

  saveSession(token: string, role: string): void {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userRole', role);
    this.isLoggedIn.set(true);
  }

  clearSession(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    this.isLoggedIn.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('userToken');
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }
}
