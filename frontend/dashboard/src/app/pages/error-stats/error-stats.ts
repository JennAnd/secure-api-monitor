// This component loads endpoint statistics and shows
// which endpoints have the highest error rates

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService, EndpointStats } from '../../core/stats.service';

@Component({
  selector: 'app-error-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-stats.html',
  styleUrls: ['./error-stats.css'],
})
export class ErrorStats implements OnInit {
  // UI state for endpoint error statistics
  endpoints: EndpointStats[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private stats: StatsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  // Load endpoint statistics and calculate error rate
  private load(): void {
    this.isLoading = true;

    this.stats.getEndpointStats().subscribe({
      next: (data) => {
        // Only keep endpoints that actually have errors
        this.endpoints = data
          .filter((e) => e.errorCount > 0)
          .map((e) => ({
            ...e,
            errorRate: Math.round((e.errorCount / e.requestCount) * 100),
          }))
          .sort((a, b) => b.errorRate - a.errorRate); // worst first

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load error statistics.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
