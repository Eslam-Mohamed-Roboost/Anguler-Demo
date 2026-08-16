// Authentication service — manages JWT token and current user state (SSR-safe)
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginService } from '../../features/booking/components/services/login.service';
import { Result } from '../models/result.model';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthProfile {
  hotelName?: string;
  name?: string;
  userName?: string;
  email?: string;
  configuration?: Configuration | null;
}
export interface Configuration {
  cityId: string
  cityName: string
  address: string
  locationUrl: string
  logoUrl: string
  commissionRate: number
  isVerified: boolean
  isBlocked: boolean
  placeTypeId: string
  placeTypeName: string
  otherPlaceText: string
  code: string
  createdDate: string
  latitude: number
  longitude: number
}
interface LoginResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly loginService = inject(LoginService);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _token = signal<string | null>(null);
  private readonly _profile = signal<AuthProfile | null>(null);

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly userName = computed(() => this.profileName() || this._user()?.name || '');
  readonly userRoles = computed(() => this._user()?.roles ?? []);
  readonly profileName = computed(() => {
    const profile = this._profile();
    return profile?.hotelName?.trim() || profile?.name?.trim() || profile?.userName?.trim() || '';
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Primary: core auth keys
      const savedToken = localStorage.getItem('auth_token');
      const savedUser  = localStorage.getItem('auth_user');
      const savedProfile = localStorage.getItem('auth_profile');
      // Fallback: LoginService keys (booking login flow)
      const loginToken = localStorage.getItem('userToken');
      const loginRole  = localStorage.getItem('userRole');

      if (savedProfile) {
        this.setStoredProfile(savedProfile);
      }

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

      if (this._token()) {
        this.refreshProfile();
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
    this._user.set({ id: 0, name: this.profileName(), email: '', roles: [normalizedRole] });
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(this._user()));
    }
  }

  refreshProfile(): void {
    if (!this._token()) return;

    this.api.get<AuthProfile>('/users/profile').subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.setProfile(result.data);
        }
      },
    });
  }

  setProfile(profile: AuthProfile): void {
    const currentProfile = this._profile();
    const mergedProfile: AuthProfile = {
      ...(currentProfile ?? {}),
      ...profile,
      configuration: profile.configuration ?? currentProfile?.configuration ?? null,
    };
    this._profile.set(mergedProfile);
    this._user.update((user) => {
      if (!user) return user;

      return { ...user, name: this.profileName() || user.name };
    });

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_profile', JSON.stringify(mergedProfile));
      const user = this._user();
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      }
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

  /** Single exit point for a session — clears core auth state and the booking login keys. */
  logout(): void {
    this._token.set(null);
    this._user.set(null);
    this._profile.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_profile');
      this.loginService.clearSession();
    }
  }

  hasRole(role: string): boolean {
    const targetRole = this.normalizeRole(role);
    return this._user()?.roles.some((userRole) => this.normalizeRole(userRole) === targetRole) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  private setStoredProfile(value: string): void {
    try {
      this._profile.set(JSON.parse(value) as AuthProfile);
    } catch {
      localStorage.removeItem('auth_profile');
    }
  }

  private normalizeRole(role: string): string {
    return role.trim().toLowerCase().replace(/[^a-z]/g, '');
  }
}
