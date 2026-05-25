// HttpContextToken to skip global error notifications on a per-request basis
import { HttpContextToken } from '@angular/common/http';

export const SKIP_ERROR_NOTIFICATION = new HttpContextToken<boolean>(() => false);
