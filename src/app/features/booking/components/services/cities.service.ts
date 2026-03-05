import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface City {
  id: string;
  name: string;
}

export interface CitiesResponse {
  isSuccess: boolean;
  data: {
    items: City[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  error?: {
    code: string;
    description: string;
    type: number;
  };
  statusCode: number;
}

@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly useMockData = false; // Set to false to use real API

  constructor() {
    console.log('🏙️ CitiesService initialized');
  }

  getCities(searchTerm?: string, pageSize: number = 50, pageNumber: number = 1): Observable<CitiesResponse> {
    if (this.useMockData) {
      console.log('📊 Using mock cities data');
      return of(this.createMockCitiesResponse(searchTerm, pageSize, pageNumber)).pipe(delay(300));
    }

    const params = new URLSearchParams();
    if (searchTerm) params.append('Name', searchTerm);
    params.append('PageSize', pageSize.toString());
    params.append('PageNumber', pageNumber.toString());

    const url = `${this.baseUrl}/city/getall?${params}`;
    console.log('📡 Fetching cities from API:', url);

    return this.http.get<CitiesResponse>(url);
  }

  private createMockCitiesResponse(searchTerm?: string, pageSize: number = 50, pageNumber: number = 1): CitiesResponse {
    const allCities: City[] = [
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Cairo' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa7', name: 'Alexandria' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa8', name: 'Giza' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa9', name: 'Sharm El Sheikh' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afaa', name: 'Hurghada' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afab', name: 'Luxor' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afac', name: 'Aswan' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afad', name: 'Dahab' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afae', name: 'Mansoura' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afaf', name: 'Tanta' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb0', name: 'Ismailia' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb1', name: 'Kafr El Sheikh' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb2', name: 'Damanhur' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb3', name: 'El Mansoura' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb4', name: 'Sohag' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb5', name: 'Qena' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb6', name: 'Asyut' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb7', name: 'Faiyum' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb8', name: 'Beni Suef' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb9', name: 'Minya' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afba', name: 'Matruh' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afbb', name: 'North Sinai' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afbc', name: 'South Sinai' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afbd', name: 'Red Sea' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afbe', name: 'New Valley' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afbf', name: 'Suez' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc0', name: 'Port Said' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc1', name: 'Damietta' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc2', name: 'Kafr El Zayat' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc3', name: '6th of October' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc4', name: 'Obour' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc5', name: 'Helwan' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc6', name: 'Badrasheen' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc7', name: '10th of Ramadan' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc8', name: 'Sharqia' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc9', name: 'Monufia' },
    ];

    // Filter by search term if provided
    let filteredCities = allCities;
    if (searchTerm) {
      filteredCities = allCities.filter(city => 
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply pagination
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCities = filteredCities.slice(startIndex, endIndex);

    return {
      isSuccess: true,
      data: {
        items: paginatedCities,
        pageNumber,
        pageSize,
        totalCount: filteredCities.length,
        totalPages: Math.ceil(filteredCities.length / pageSize)
      },
      statusCode: 200
    };
  }
}
