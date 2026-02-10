import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogsTableComponent } from '../../dashboard/logs-table/logs-table';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, LogsTableComponent],
  templateUrl: './logs.html',
  styleUrls: ['./logs.css'],
})
export class Logs {}
