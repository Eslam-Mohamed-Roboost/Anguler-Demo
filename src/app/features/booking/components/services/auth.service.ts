import { Injectable } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { JoinUsFormModel } from '../../models/JoinUsForm-model';
import { map, Observable, tap, catchError, of } from 'rxjs';
import { isSuccess, Result } from '../../../../core/models/result.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ApiService{
  
  Register(model: JoinUsFormModel): Observable<Result<any>> {
 

    return this.post<any>('/hotels', model).pipe(
      tap(result => {
        console.log('📡 Hotel registration response:', result);
      }),
      map(result => {
        if (isSuccess(result)) {
          console.log('✅ Hotel registration successful:', result.data);
          return result;
        } else {
          console.error('❌ Hotel registration failed:', result.error);
          return result;
        }
      }),
      catchError(error => {
        console.error('💥 Hotel registration error:', error);
        // Return a failure result for network errors
        return of({
          isSuccess: false,
          data: null,
          error: {
            code: 'Network.Error',
            description: 'Network error occurred. Please check your connection.',
            type: 0
          },
          statusCode: 0
        });
      })
    );
  }
}
