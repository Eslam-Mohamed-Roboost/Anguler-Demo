import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private readonly http = inject(HttpClient);

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('Image', file);

    return this.http
      .post(`${environment.apiUrl}/upload-image`, formData, {
        responseType: 'text',
      })
      .pipe(map((response) => this.normalizeImageUrl(response)));
  }

  private normalizeImageUrl(response: string): string {
    const value = response.trim();

    if (!value) {
      return value;
    }

    try {
      const parsed = JSON.parse(value) as unknown;

      if (typeof parsed === 'string') {
        return parsed;
      }

      if (parsed && typeof parsed === 'object') {
        const record = parsed as Record<string, unknown>;
        const url = record['url'] ?? record['imageUrl'] ?? record['logoUrl'] ?? record['data'];
        return typeof url === 'string' ? url : value;
      }
    } catch {
      // Plain text URL response.
    }

    return value;
  }
}
