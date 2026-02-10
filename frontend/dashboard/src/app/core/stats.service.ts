// Provides methods for fetching API statistics from the backend
import { AuthService } from '../auth/auth.service';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OverviewStats {
  totalRequests: number;
  errorRequests: number;
  errorRatePercent: number;
  averageResponseTimeMs: number;
}

export interface EndpointStats {
  endpoint: string;
  requestCount: number;
  errorCount: number;
  averageResponseTimeMs: number;

  // Calculated only in frontend (not returned by backend)
  errorRate?: number;
}

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly apiBaseUrl = 'http://localhost:5062/api';

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getOverviewStats(): Observable<OverviewStats> {
    return this.http.get<OverviewStats>(`${this.apiBaseUrl}/stats/overview`, {
      headers: this.getAuthHeaders(),
    });
  }

  getEndpointStats(): Observable<EndpointStats[]> {
    return this.http.get<EndpointStats[]>(`${this.apiBaseUrl}/stats/endpoints`, {
      headers: this.getAuthHeaders(),
    });
  }
}
