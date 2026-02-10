import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

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

// Represents a detected security issue
interface SecurityEvent {
  type: string;
  description: string;
  ip: string;
  count: number;
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

  private load(): void {
    this.isLoading = true;
    this.events = []; // clear old detections

    const token = this.auth.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    this.http.get<ApiLog[]>(`${this.apiBaseUrl}/logs`, { headers }).subscribe({
      next: (logs) => {
        this.detectBruteForce(logs);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load security events.';
        this.isLoading = false;
      },
    });
  }

  // Detect repeated failed login attempts
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
}
