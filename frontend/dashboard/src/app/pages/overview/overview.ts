import { Component } from '@angular/core';
import { StatsChartsComponent } from '../../dashboard/stats-charts/stats-charts';
import { LogsTableComponent } from '../../dashboard/logs-table/logs-table';

@Component({
  selector: 'app-overview',
  imports: [StatsChartsComponent, LogsTableComponent],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {}
