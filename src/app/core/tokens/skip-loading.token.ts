// HttpContextToken to skip global loading indicator on a per-request basis
import { HttpContextToken } from '@angular/common/http';

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);
