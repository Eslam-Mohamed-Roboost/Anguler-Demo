// Authentication service — manages JWT token and current user state (SSR-safe)
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Result } from '../models/result.model';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _token = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly userName = computed(() => this._user()?.name ?? '');
  readonly userRoles = computed(() => this._user()?.roles ?? []);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Primary: core auth keys
      const savedToken = localStorage.getItem('auth_token');
      const savedUser  = localStorage.getItem('auth_user');
      // Fallback: LoginService keys (booking login flow)
      const loginToken = localStorage.getItem('userToken');
      const loginRole  = localStorage.getItem('userRole');

      if (savedToken) {
        this._token.set(savedToken);
        if (savedUser) {
          try {
            this._user.set(JSON.parse(savedUser));
          } catch {
            localStorage.removeItem('auth_user');
          }
        }
      } else if (loginToken && loginRole) {
        this._token.set(loginToken);
        this._user.set({ id: 0, name: '', email: '', roles: [loginRole.toLowerCase()] });
      }
    }
  }

  /**
   * Called after a successful login through the booking LoginService.
   * Syncs the token + role into this service so guards work correctly.
   */
  setSession(token: string, role: string): void {
    const normalizedRole = role.toLowerCase();
    this._token.set(token);
    this._user.set({ id: 0, name: '', email: '', roles: [normalizedRole] });
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(this._user()));
    }
  }

  login(email: string, password: string): Observable<Result<LoginResponse>> {
    return this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
      tap((result) => {
        if (result.isSuccess && result.data) {
          this._token.set(result.data.token);
          this._user.set(result.data.user);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('auth_token', result.data.token);
            localStorage.setItem('auth_user', JSON.stringify(result.data.user));
          }
        }
      }),
    );
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  hasRole(role: string): boolean {
    return this._user()?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }
}
