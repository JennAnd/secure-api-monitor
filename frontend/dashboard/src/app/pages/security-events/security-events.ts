import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

// Represents one API request log
interface ApiLog {
  id: number;
  timestamp: string;
  ipAddress: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTimeMs: number;
  errorMessage: string | null;
}

// Represents a detected security event
interface SecurityEvent {
  type: string;
  description: string;
  ip: string;
  count: number;
  endpoint?: string;
}

@Component({
  selector: 'app-security-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './security-events.html',
  styleUrls: ['./security-events.css'],
})
export class SecurityEvents implements OnInit {
  events: SecurityEvent[] = [];
  isLoading = false;
  errorMessage = '';

  private readonly apiBaseUrl = 'http://localhost:5062/api';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Fires every time the route becomes active (even if component is reused)
    this.route.url.subscribe(() => {
      this.load();
    });
  }

  // Load logs and detect security events
  private load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.events = []; // clear old detections

    const token = this.auth.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    this.http.get<ApiLog[]>(`${this.apiBaseUrl}/logs`, { headers }).subscribe({
      next: (logs) => {
        // Only use logs from the last 24 hours for security event detection
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentLogs = logs.filter((log) => {
          return new Date(log.timestamp) >= twentyFourHoursAgo;
        });
        this.detectBruteForce(recentLogs);
        this.detectErrorSpike(recentLogs);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load security events.';
        this.isLoading = false;
      },
    });
  }

  // Detect repeated failed login attempts from the same IP
  private detectBruteForce(logs: ApiLog[]): void {
    const failedLogins = logs.filter(
      (l) => l.endpoint === '/api/auth/login' && l.statusCode === 401,
    );

    const grouped: Record<string, number> = {};

    for (const log of failedLogins) {
      grouped[log.ipAddress] = (grouped[log.ipAddress] || 0) + 1;
    }

    for (const ip in grouped) {
      if (grouped[ip] >= 5) {
        this.events.push({
          type: 'Brute force attempt',
          description: 'Multiple failed login attempts detected',
          ip,
          count: grouped[ip],
        });
      }
    }
  }
  // Detect endpoints with a high percentage of failed requests
  private detectErrorSpike(logs: ApiLog[]): void {
    const grouped: Record<string, { total: number; errors: number }> = {};

    for (const log of logs) {
      const endpoint = log.endpoint;

      if (!grouped[endpoint]) {
        grouped[endpoint] = { total: 0, errors: 0 };
      }

      grouped[endpoint].total++;

      if (log.statusCode >= 400) {
        grouped[endpoint].errors++;
      }
    }

    for (const endpoint in grouped) {
      const total = grouped[endpoint].total;
      const errors = grouped[endpoint].errors;

      // Only flag endpoints with enough traffic to matter
      if (total >= 5) {
        const errorRate = (errors / total) * 100;

        if (errorRate >= 30) {
          this.events.push({
            type: 'High error rate',
            description: 'Unusually high number of failed requests detected',
            ip: '-',
            endpoint,
            count: errors,
          });
        }
      }
    }
  }
}
