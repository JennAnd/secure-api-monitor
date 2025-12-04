import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../layout/navbar/navbar';
import { SidebarComponent } from '../layout/sidebar/sidebar';
import { LogsTableComponent } from './logs-table/logs-table';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,
     NavbarComponent,
     SidebarComponent,
     LogsTableComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent {
  // Text to show that the user reached the dashboard
  title = 'Secure API Monitor - Dashboard';
}
