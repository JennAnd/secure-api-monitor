// This component manages user session info and dashboard preferences
// such as auto refresh and refresh interval

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../core/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class Settings implements OnInit {
  username = '';

  // Current values
  autoRefresh = true;
  refreshSeconds = 10;

  // Original values (used to detect changes)
  originalAutoRefresh = true;
  originalRefreshSeconds = 10;

  // Shows a short success message after saving
  saved = false;

  constructor(
    private auth: AuthService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.loadUser();

    const s = this.settingsService.current;

    this.autoRefresh = s.autoRefresh;
    this.refreshSeconds = s.refreshSeconds;

    // Store original values
    this.originalAutoRefresh = s.autoRefresh;
    this.originalRefreshSeconds = s.refreshSeconds;
  }

  // Decode username from JWT token
  private loadUser() {
    const token = this.auth.getToken();
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    this.username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
  }

  // Check if user has made changes
  hasChanges(): boolean {
    return (
      this.autoRefresh !== this.originalAutoRefresh ||
      this.refreshSeconds !== this.originalRefreshSeconds
    );
  }

  // Save current settings and show short feedback
  save(): void {
    this.settingsService.update({
      autoRefresh: this.autoRefresh,
      refreshSeconds: this.refreshSeconds,
    });

    // Update original values
    this.originalAutoRefresh = this.autoRefresh;
    this.originalRefreshSeconds = this.refreshSeconds;

    this.saved = true;

    setTimeout(() => {
      this.saved = false;
    }, 2000);
  }
}
