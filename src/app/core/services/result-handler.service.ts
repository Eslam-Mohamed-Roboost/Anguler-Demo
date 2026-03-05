import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Result, isSuccess, isFailure } from '../models/result.model';

/**
 * Service to handle Result pattern and unwrap data for components
 * This allows gradual migration from direct data to Result pattern
 */
@Injectable({ providedIn: 'root' })
export class ResultHandlerService {
  /**
   * Unwraps data from Result<T> and returns just T
   * Throws error if Result is failure
   */
  unwrapData<T>(result: Result<T>): T {
    if (isSuccess(result)) {
      return result.data!;
    }
    throw new Error(result.error?.description || 'Request failed');
  }

  /**
   * Unwraps data from Observable<Result<T>> and returns Observable<T>
   * Throws error if Result is failure
   */
  unwrapData$<T>(source: Observable<Result<T>>): Observable<T> {
    return source.pipe(
      map(result => this.unwrapData(result))
    );
  }

  /**
   * Unwraps data from Result<T> and returns T | null
   * Returns null if Result is failure
   */
  unwrapDataOrNull<T>(result: Result<T>): T | null {
    if (isSuccess(result)) {
      return result.data;
    }
    return null;
  }

  /**
   * Unwraps data from Observable<Result<T>> and returns Observable<T | null>
   * Returns null if Result is failure
   */
  unwrapDataOrNull$<T>(source: Observable<Result<T>>): Observable<T | null> {
    return source.pipe(
      map(result => this.unwrapDataOrNull(result))
    );
  }

  /**
   * Maps Result<T> to T for Angular RxResource
   * This is specifically for RxResource stream functions
   */
  mapForRxResource<T>(source: Observable<Result<T>>): Observable<T> {
    return this.unwrapData$(source);
  }

  /**
   * Maps Result<T[]> to T[] for Angular RxResource
   * This is specifically for RxResource stream functions
   */
  mapArrayForRxResource<T>(source: Observable<Result<T[]>>): Observable<T[]> {
    return this.unwrapData$(source);
  }

  /**
   * Handle Result with success/failure callbacks
   */
  handleResult<T>(
    result: Result<T>,
    onSuccess: (data: T) => void,
    onFailure?: (error: any) => void
  ): void {
    if (isSuccess(result)) {
      onSuccess(result.data!);
    } else if (onFailure) {
      onFailure(result.error);
    }
  }

  /**
   * Handle Observable<Result<T>> with success/failure callbacks
   */
  handleResult$<T>(
    source: Observable<Result<T>>,
    onSuccess: (data: T) => void,
    onFailure?: (error: any) => void
  ): void {
    source.subscribe({
      next: (result) => this.handleResult(result, onSuccess, onFailure),
      error: (error) => onFailure?.(error)
    });
  }
}
