import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JoinUsService {
  private readonly _openRequested = new Subject<void>();
  readonly openRequested$ = this._openRequested.asObservable();

  private readonly _signInRequested = new Subject<void>();
  readonly signInRequested$ = this._signInRequested.asObservable();

  requestOpen(): void {
    this._openRequested.next();
  }

  requestSignIn(): void {
    this._signInRequested.next();
  }
}
