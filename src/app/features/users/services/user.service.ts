// User feature service — extends BaseCrudService with user-specific endpoint
import { Injectable } from '@angular/core';
import { BaseCrudService } from '../../../core/services/base-crud.service';
import type { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseCrudService<User> {
  readonly endpoint = '/users';
}
