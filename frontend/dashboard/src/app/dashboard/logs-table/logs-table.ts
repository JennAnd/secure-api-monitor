import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';

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
    MatTableModule,
    FormsModule
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
    // Logs that are actually shown in the table (after filtering)
  filteredLogs: ApiLog[] = [];


    // Filter values bound to the filter inputs in the template
  endpointFilter = '';
  statusFilter = '';
  dateFrom: string | null = null;
  dateTo: string | null = null;

     // Applies endpoint, status and date filters to logs
  applyFilters(): void {
    console.log('🔍 applyFilters() called. logs.length =', this.logs.length);
    this.filteredLogs = this.logs.filter((log) => {
      // Filter by endpoint
      if (this.endpointFilter) {
        const endpointMatch = log.endpoint
          .toLowerCase()
          .includes(this.endpointFilter.toLowerCase());
        if (!endpointMatch) {
          return false;
        }
      }

      // Filter by status code (exact number match)
     if (this.statusFilter !== null && this.statusFilter !== undefined && this.statusFilter !== '') {
  const statusAsNumber = Number(this.statusFilter);
  if (!Number.isNaN(statusAsNumber) && log.statusCode !== statusAsNumber) {
    return false;
  }
}

      // Filter by date range (compare date part only)
if (this.dateFrom || this.dateTo) {

  if (!log.timestamp) {
    return false;
  }

  const logDate = log.timestamp.slice(0, 10); // "2025-12-04"

  if (this.dateFrom && logDate < this.dateFrom) {
    return false;
  }

  if (this.dateTo && logDate > this.dateTo) {
    return false;
  }
}

      return true;
    });
    console.log('✅ filteredLogs.length =', this.filteredLogs.length);
  }

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
          console.log('✅ Logs loaded from API:', data);
          this.logs = data;
          this.isLoading = false;
          this.applyFilters(); 
        },
        error: () => {
          this.errorMessage = 'Failed to load logs.';
          this.isLoading = false;
        },
      });
  }
}