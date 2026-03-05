/**
 * Result pattern for standardized API responses
 * Matches the API response structure with success/error handling
 */

export interface ApiError {
  code: string;
  description: string;
  type: number;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T | null;
  error: ApiError | null;
  statusCode: number;
}

export type Result<T> = ApiResponse<T>;

/**
 * Helper functions for creating Result objects
 */
export class ResultHelper {
  static success<T>(data: T, statusCode: number = 200): Result<T> {
    return {
      isSuccess: true,
      data,
      error: null,
      statusCode
    };
  }

  static failure<T>(
    error: ApiError, 
    statusCode: number = 400,
    data: T | null = null
  ): Result<T> {
    return {
      isSuccess: false,
      data,
      error,
      statusCode
    };
  }

  static validationError(description: string, data?: any): Result<any> {
    return this.failure(
      {
        code: 'Validation.Error',
        description,
        type: 1
      },
      400,
      data
    );
  }

  static notFound(resource: string): Result<any> {
    return this.failure(
      {
        code: 'NotFound',
        description: `${resource} not found`,
        type: 2
      },
      404
    );
  }

  static unauthorized(message: string = 'Unauthorized'): Result<any> {
    return this.failure(
      {
        code: 'Unauthorized',
        description: message,
        type: 3
      },
      401
    );
  }

  static serverError(message: string = 'Internal server error'): Result<any> {
    return this.failure(
      {
        code: 'ServerError',
        description: message,
        type: 4
      },
      500
    );
  }

  static forbidden(message: string = 'Forbidden'): Result<any> {
    return this.failure(
      {
        code: 'Forbidden',
        description: message,
        type: 5
      },
      403
    );
  }
}

/**
 * Type guard to check if Result is successful
 */
export function isSuccess<T>(result: Result<T>): result is Result<T> & { isSuccess: true; data: T } {
  return result.isSuccess;
}

/**
 * Type guard to check if Result is failure
 */
export function isFailure<T>(result: Result<T>): result is Result<T> & { isSuccess: false; error: ApiError } {
  return !result.isSuccess;
}
