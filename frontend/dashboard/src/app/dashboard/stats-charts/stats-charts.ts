// This component loads overview statistics and shows
// charts for API traffic, errors, and endpoint usage

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { StatsService, OverviewStats, EndpointStats } from '../../core/stats.service';
import { ChartConfiguration, ChartType } from 'chart.js';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-stats-charts',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, MatProgressSpinnerModule],
  templateUrl: './stats-charts.html',
  styleUrls: ['./stats-charts.css'],
})
export class StatsChartsComponent implements OnInit {
  // Inject services used in this component
  private stats = inject(StatsService);
  private cdr = inject(ChangeDetectorRef);

  // UI state
  isLoading = false;
  errorMessage = '';

  // Data models
  overview?: OverviewStats;
  endpoints: EndpointStats[] = [];

  // Chart settings: pie chart for success/error ratio
  pieChartType: ChartType = 'pie';
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Successful', 'Errors'],
    datasets: [{ data: [0, 0] }],
  };

  // Chart settings: bar chart for requests per endpoint
  barChartType: ChartType = 'bar';
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ label: 'Requests per endpoint', data: [] }],
  };

  ngOnInit(): void {
    this.loadOverview();
  }

  // Loads the overview statistics (total requests, errors, avg time)
  private loadOverview(): void {
    this.isLoading = true;

    this.stats.getOverviewStats().subscribe({
      next: (o) => {
        this.overview = o;

        // Calculate number of successful requests
        const success = o.totalRequests - o.errorRequests;

        // Update pie chart data
        this.pieChartData = {
          labels: ['Successful', 'Errors'],
          datasets: [{ data: [success, o.errorRequests] }],
        };

        // After overview is loaded, load per-endpoint statistics
        this.loadEndpoints();
      },
      error: () => {
        this.errorMessage = 'Failed to load statistics.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Loads the statistics grouped by endpoint (used for bar chart)
  private loadEndpoints(): void {
    this.stats.getEndpointStats().subscribe({
      next: (list) => {
        this.endpoints = list;

        // Update bar chart with endpoint names + request counts
        this.barChartData = {
          labels: list.map((x) => x.endpoint),
          datasets: [{ label: 'Requests per endpoint', data: list.map((x) => x.requestCount) }],
        };

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load endpoint statistics.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
