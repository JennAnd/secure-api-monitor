import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../auth/auth.service';

// Represents one log entry returned from the backend API
export interface ApiLog {
  id: number;
  timestamp: string;
  ipAddress: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTimeMs: number;
  errorMessage: string | null;
}

@Component({
  selector: 'app-logs-table',
  standalone: true,
  imports: [CommonModule,
    MatTableModule
  ],
  templateUrl: './logs-table.html',
  styleUrls: ['./logs-table.css'],
})
export class LogsTableComponent implements OnInit {
  // Columns to show in the Angular Material table
  displayedColumns: string[] = [
    'timestamp',
    'method',
    'endpoint',
    'statusCode',
    'responseTimeMs',
  ];

  // All log rows loaded from the backend
  logs: ApiLog[] = [];

  // Loading + error flags for the UI
  isLoading = false;
  errorMessage = '';

  // Base URL for the backend API
  private readonly apiBaseUrl = 'http://localhost:5062/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  // Loads all logs from the /api/logs endpoint using the JWT token
  private loadLogs(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const token = this.authService.getToken();

    // Build headers with Authorization if we have a token
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    this.http
      .get<ApiLog[]>(`${this.apiBaseUrl}/logs`, { headers })
      .subscribe({
        next: (data) => {
          this.logs = data;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load logs.';
          this.isLoading = false;
        },
      });
  }
}