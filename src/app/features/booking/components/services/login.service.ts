import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, throwError, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  data?: {
    token?: string;
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role?: string;
    };
  };
  error?: {
    code: string;
    description: string;
    type: number;
  };
  statusCode: number;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly useMockData = false; // Set to false to use real API

  constructor() {
    console.log('🔐 LoginService initialized');
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔐 LoginService.login() called with:', credentials);
    console.log('🔧 useMockData:', this.useMockData);
    console.log('🌐 baseUrl:', this.baseUrl);
    
    if (this.useMockData) {
      console.log('📊 Using mock login data');
      return this.mockLogin(credentials);
    }

    const apiUrl = `${this.baseUrl}/users/login`;
    console.log('📡 Sending login request to API:', apiUrl);
    
    return this.http.post<LoginResponse>(apiUrl, credentials).pipe(
      // Add logging to the observable
      tap({
        next: (response: LoginResponse) => console.log('📡 API response received:', response),
        error: (error: any) => console.error('📡 API error:', error),
        complete: () => console.log('📡 API call completed')
      })
    );
  }

  logout(): Observable<void> {
    console.log('📡 Logging out user');
    // Clear local storage or session
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    return of(void 0);
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userToken');
  }

  saveUserSession(user: User): void {
    localStorage.setItem('userToken', user.token || '');
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  clearUserSession(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
  }

  private mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('📊 Mock login attempt:', credentials.email);
    
    // Simulate API delay
    return new Observable(observer => {
      setTimeout(() => {
        // Mock validation
        if (!credentials.email || !credentials.email.includes('@')) {
          observer.next({
            isSuccess: false,
            data: undefined,
            error: {
              code: 'Validation.Error',
              description: 'Validation failed:\n Email must be a valid email address.',
              type: 1
            },
            statusCode: 400
          });
          observer.complete();
          return;
        }

        if (!credentials.password || credentials.password.length < 8) {
          observer.next({
            isSuccess: false,
            data: undefined,
            error: {
              code: 'Validation.Error',
              description: 'Validation failed:\n Password must be at least 8 characters long.',
              type: 1
            },
            statusCode: 400
          });
          observer.complete();
          return;
        }

        // Mock successful login
        const mockUser: User = {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          email: credentials.email,
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          token: 'mock-jwt-token-' + Date.now()
        };

        observer.next({
          isSuccess: true,
          data: {
            token: mockUser.token,
            user: mockUser
          },
          statusCode: 200
        });
        observer.complete();
      }, 800); // Simulate network delay
    });
  }
}
