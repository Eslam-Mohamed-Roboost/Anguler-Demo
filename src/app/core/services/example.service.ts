import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Result, isSuccess, isFailure, ResultHelper } from '../models/result.model';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class ExampleService {
  private readonly api = inject(ApiService);

  /**
   * Example of using the Result pattern for login
   */
  login(credentials: LoginRequest): Observable<Result<LoginResponse>> {
    return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
      map(result => {
        if (isSuccess(result)) {
          // Handle successful login
          console.log('Login successful:', result.data);
          return result;
        } else {
          // Handle login error
          console.error('Login failed:', result.error);
          return result;
        }
      })
    );
  }

  /**
   * Example of getting user data
   */
  getUser(id: string): Observable<Result<User>> {
    return this.api.get<User>(`/users/${id}`).pipe(
      map(result => {
        if (isSuccess(result)) {
          console.log('User retrieved:', result.data);
          return result;
        } else {
          if (result.error?.code === 'NotFound') {
            console.log('User not found');
          } else {
            console.error('Error retrieving user:', result.error);
          }
          return result;
        }
      })
    );
  }

  /**
   * Example of creating a user with validation
   */
  createUser(userData: Partial<User>): Observable<Result<User>> {
    // Client-side validation example
    if (!userData.email || !userData.email.includes('@')) {
      return new Observable(observer => {
        observer.next(ResultHelper.validationError('Email must be a valid email address'));
        observer.complete();
      });
    }

    if (!userData.name || userData.name.length < 2) {
      return new Observable(observer => {
        observer.next(ResultHelper.validationError('Name must be at least 2 characters long'));
        observer.complete();
      });
    }

    return this.api.post<User>('/users', userData);
  }

  /**
   * Example of handling different error types
   */
  deleteUser(id: string): Observable<Result<void>> {
    return this.api.delete<void>(`/users/${id}`).pipe(
      map(result => {
        if (isFailure(result)) {
          switch (result.error?.code) {
            case 'Unauthorized':
              console.log('User is not authorized to delete this user');
              break;
            case 'Forbidden':
              console.log('User does not have permission to delete this user');
              break;
            case 'NotFound':
              console.log('User does not exist');
              break;
            default:
              console.error('Unexpected error:', result.error);
          }
        }
        return result;
      })
    );
  }

  /**
   * Example of chaining operations with Result pattern
   */
  updateUserAndNotify(id: string, updates: Partial<User>): Observable<Result<User>> {
    return this.api.patch<User>(`/users/${id}`, updates).pipe(
      map(result => {
        if (isSuccess(result)) {
          // Send notification after successful update
          this.sendNotification('User updated successfully');
          return result;
        } else {
          return result;
        }
      })
    );
  }

  private sendNotification(message: string): void {
    // Implementation for sending notifications
    console.log('Notification:', message);
  }
}
