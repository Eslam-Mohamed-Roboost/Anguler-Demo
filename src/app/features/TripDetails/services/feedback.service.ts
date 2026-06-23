import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { Result } from '../../../core/models/result.model';

@Injectable({ providedIn: 'root' })
export class FeedbackService extends ApiService {
  submitFeedback(tripId: string, rating: number, comment: string): Observable<Result<void>> {
    return this.post<void>('/feedbacks', { tripId, rating, comment });
  }
}
