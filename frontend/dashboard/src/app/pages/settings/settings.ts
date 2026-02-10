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

  // preferences
  autoRefresh = true;
  refreshSeconds = 10;

  constructor(
    private auth: AuthService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.loadUser();

    const s = this.settingsService.current;
    this.autoRefresh = s.autoRefresh;
    this.refreshSeconds = s.refreshSeconds;
  }

  // Decode username from token
  private loadUser() {
    const token = this.auth.getToken();
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    this.username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
  }

  // Save preferences
  save(): void {
    this.settingsService.update({
      autoRefresh: this.autoRefresh,
      refreshSeconds: this.refreshSeconds,
    });
  }

  logout(): void {
    this.auth.logout();
    location.href = '/login';
  }
}
