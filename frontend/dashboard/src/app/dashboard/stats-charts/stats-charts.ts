import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { StatsService, OverviewStats, EndpointStats } from '../../core/stats.service';
import { ChartConfiguration, ChartType } from 'chart.js';


@Component({
  selector: 'app-stats-charts',
  standalone: true,
  imports: [CommonModule,
     BaseChartDirective],
  templateUrl: './stats-charts.html',
  styleUrls: ['./stats-charts.css'],
})
export class StatsChartsComponent implements OnInit {
  // Inject the StatsService to access backend statistics
  private stats = inject(StatsService);

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
          datasets: [
            { label: 'Requests per endpoint', data: list.map((x) => x.requestCount) },
          ],
        };

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load endpoint statistics.';
        this.isLoading = false;
      },
    });
  }
}

